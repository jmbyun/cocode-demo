import sys
import json
import urllib.request
import urllib.error
import traceback
from browser import window
from cocode import runner


def get_content_from_url(url):
    try:
        f = urllib.request.urlopen(url)
        code_content = f.read()
        return code_content
    except urllib.error.HTTPError:
        return None


def get_locals():
    safe_list = ['math', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'cosh', 'de grees', 'e', 'exp', 'fabs', 'floor',
                 'fmod', 'frexp', 'hypot', 'ldexp', 'log', 'log10', 'modf', 'pi', 'pow', 'radians', 'sin', 'sinh', 'sqrt', 'tan', 'tanh']
    safe_dict = dict([(k, locals().get(k, None)) for k in safe_list])
    return safe_dict


def print_traceback(exc, code=None, trim=True):
    def get_code_line(line_num):
        if code is None:
            return '<code>'
        code_lines = code.split('\n')
        try:
            return code_lines[line_num - 1].strip()
        except IndexError:
            return '<code>'
    lines = ['Traceback(most recent call last):']
    etype, value, tb = sys.exc_info()
    frame_summaries = traceback.extract_tb(tb)
    for fr in frame_summaries:
        if fr[0] == '<string>' and (fr[2] == '<module>' or fr[2].startswith('$exec_')):
            if trim:
                lines = ['Traceback(most recent call last):']
            lines.append('  File "%s", line %d, in %s' % ('<usercode>', fr[1], '<module>'))
            lines.append('    %s' % get_code_line(fr[1]))
        else:
            lines.append('  File "%s", line %d, in %s' % (fr[0], fr[1], fr[2]))
            if fr[3]:
                lines.append('    %s' % fr[3])
    lines.append(''.join(traceback.format_exception_only(etype, value)))
    sys.stderr.write('\n'.join(lines))

def run_code(code_content, write_out=None, write_err=None, send_message=None, namespace=None):
    runner.set_stdout_sender(write_out)
    runner.set_stderr_sender(write_err)
    runner.set_sender(send_message)
    exit_code = 1

    def run():
        exec(code_content, target_namespace, get_locals())

    if namespace is None:
        target_namespace = {'__name__': '__main__'}
    else:
        target_namespace = namespace
    try:
        run()
        exit_code = 0

    except Exception as exc:
        # traceback.print_exc()
        print_traceback(exc, code=code_content)

    runner.set_sender(None)
    return exit_code


def run_url(project_url, write_out=None, write_err=None, send_message=None, namespace=None):
    code_content = get_content_from_url(project_url + 'files/main.py')
    if code_content is None:
        sys.stderr.write('Failed to load "main.py".')
        return 0

    return run_code(code_content, write_out, write_err, send_message, namespace)


def grade_code_stdio(code_content, grader, write_out, write_info):
    output_values = []
    score = 0

    def store_grader_output(msg):
        output_values.append(msg)

    for i, test in enumerate(grader['tests']):
        if 'in' in test:
            if type(test['in']) == list:
                runner.set_input_values(test['in'])
            else:
                runner.set_input_values(test['in'].split('\n'))
        output_values = []
        runner.set_stdout_sender(store_grader_output)
        try:
            exec(code_content, {'__name__': '__main__'})
        except Exception as exc:
            write_info('Error has occurred while grading your code.\n')
            print_traceback(exc, code=code_content)
        runner.set_stdout_sender(write_out)
        if ''.join(output_values).strip() == test['out'].strip():
            score += test['score']
            write_info('Test %d (%d): Pass\n' % (i, test['score']))
            if 'pass_msg' in test:
                write_info('%s\n' % (test['pass_msg']))
        else:
            write_info('Test %d (%d): Fail\n' % (i, test['score']))
            if 'fail_msg' in test:
                write_info('%s\n' % (test['fail_msg']))

    write_info('Your total score is: %d\n' % score)
    return score


def grade_code_assert(code_content, grader, write_out, write_info):
    score = 0

    for i, test in enumerate(grader['tests']):
        if 'in' in test:
            if type(test['in']) == list:
                runner.set_input_values(test['in'])
            else:
                runner.set_input_values(test['in'].split('\n'))

        __assert_results__ = []
        def asserter(value):
            __assert_results__.append(bool(value))
        write_info(__assert_results__)
        assert_codes = []
        for assert_value in test['asserts']:
            assert_codes.append('try:')
            assert_codes.append('  __assert__(%s)' % assert_value)
            assert_codes.append('except NameError:')
            assert_codes.append('  __assert__(False)')
        merged_code_content = code_content + '\n' + '\n'.join(assert_codes)
            
        runner.set_stdout_sender(lambda x: None)
        try:
            exec(merged_code_content, {
                '__name__': '__main__',
                '__assert__': asserter,
                '__assert_results__': __assert_results__,
            })
        except Exception as exc:
            write_info('Error has occurred while grading your code.\n')
            print_traceback(exc, code=merged_code_content)
        runner.set_stdout_sender(write_out)

        if all(__assert_results__):
            score += test['score']
            write_info('Test %d (%d): Pass\n' % (i, test['score']))
            if 'pass_msg' in test:
                write_info('%s\n' % (test['pass_msg']))
        else:
            write_info('Test %d (%d): Fail\n' % (i, test['score']))
            if 'fail_msg' in test:
                write_info('%s\n' % (test['fail_msg']))
    write_info('Your total score is: %d\n' % score)
    return score


def grade_code_code(code_content, grader, write_out, write_info):
    __store__ = {}
    def set_score(score):
        __store__['score'] = score
    def set_message(message):
        __store__['message'] = message

    try:
        exec(grader['code'], {
            '__name__': '__main__',
            '__code__': code_content,
            '__set_score__': set_score,
            '__set_message__': set_message,
            '__store__': __store__,
        })
    except Exception as exc:
        write_info('Error has occurred while grading your code.\n')
        print_traceback(exc, code=grader['code'])

    if 'message' in __store__:
        write_info('%s\n' % __store__['message'])
            
    if 'score' in __store__:
        score = __store__['score']
    else:
        score = 0
    write_info('Your total score is: %d\n' % score)
    return score


def grade_code(code_content, grader_json, write_out=None, write_info=None, write_err=None):
    runner.set_stderr_sender(write_err)
    grader = json.loads(grader_json)
    code_grader_dict = {
        'stdio': grade_code_stdio,
        'assert': grade_code_assert,
        'code': grade_code_code,
    }
    if grader['grader_type'] in code_grader_dict:
        return code_grader_dict[grader['grader_type']](code_content, grader, write_out, write_info)
    else:
        sys.stderr.write('Invalid grader type.\n')
        return 0


def grade_url(project_url, grader_json, write_out=None, write_info=None, write_err=None):
    code_content = get_content_from_url(project_url + 'files/main.py')
    if code_content is None:
        sys.stderr.write('Failed to load "main.py".')
        return 0

    return grade_code(code_content, grader_json, write_out, write_info, write_err)


def call_on_ready(callback):
    callback()


window.callOnReady = call_on_ready
window.runCode = run_code
window.runUrl = run_url
window.gradeCode = grade_code
window.gradeUrl = grade_url
