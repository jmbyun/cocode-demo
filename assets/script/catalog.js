

(function (globals) {

    var django = globals.django || (globals.django = {});


    django.pluralidx = function (n) {
        var v = (n != 1);
        if (typeof (v) == 'boolean') {
            return v ? 1 : 0;
        } else {
            return v;
        }
    };


    /* gettext library */

    django.catalog = django.catalog || {};

    var newcatalog = {
        "\uadf8\ub807\ub2e4": "Agree",
        "\uadf8\ub807\uc9c0 \uc54a\ub2e4": "Disagree",
        "\ub124": "Yes",
        "\ub2e4\uc2dc \uc2dc\ub3c4": "Retry",
        "\ub2e4\uc2dc \uc2dc\ub3c4\ud574\ubcf4\uc138\uc694.": "Please retry.",
        "\ub2e4\uc74c": "Next",
        "\ub2e4\uc74c \uc7a5\uc73c\ub85c \uc774\ub3d9": "Next Chapter",
        "\ub3cc\uc544\uac00\uae30": "Previous",
        "\ub3d9\ub8cc \ud654\uba74 \ub044\uae30": "Hide Screens",
        "\ub3d9\ub8cc \ud654\uba74 \ucf1c\uae30": "Show Screens",
        "\ub9e4\uc6b0 \uadf8\ub807\ub2e4": "Strongly Agree",
        "\ub9e4\uc6b0 \uadf8\ub807\uc9c0 \uc54a\ub2e4": "Strongly Disagree",
        "\ubaa8\ub4e0 \uacfc\ubaa9": "All Courses",
        "\ubaa8\ub4e0 \ud544\uc218 \uc9c8\ubb38\uc5d0 \ub2f5\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.": "Please answer to all required questions.",
        "\ubcf4\ud1b5\uc774\ub2e4": "Neutral",
        "\uc131\uacf5!": "Success!",
        "\uc218\uc815 \uc911...": "Editing...",
        "\uc2e4\ud589": "Run",
        "\uc2e4\ud589 \uc911...": "Running...",
        "\uc544\ub2c8\uc624": "No",
        "\uc54c\ub9bc": "Alert",
        "\uc774\ubc88 \ubb38\uc81c\ub97c \ud478\ub294 \ub3d9\uc548\uc5d0 \ud654\uba74 \uc624\ub978\ucabd\uc5d0 \ub2e4\ub978 \ud559\uc0dd\ub4e4\uc774 \ubb38\uc81c \ud478\ub294 \ubaa8\uc2b5\uc774 \ubcf4\uc774\ub3c4\ub85d \ud560\uae4c\uc694?": "Do you want to see co-learner screens for this exercise?",
        "\uc775\uba85": "Anonymous",
        "\uc77c\uc815 \uc2dc\uac04\ub3d9\uc548 \uc0ac\uc6a9\ud558\uc9c0 \uc54a\uc544\uc11c \uc811\uc18d\uc774 \uc885\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4. \ud655\uc778 \ubc84\ud2bc\uc744 \ub204\ub974\uc2dc\uba74 \uc11c\ubc84\uc640 \ub2e4\uc2dc \uc5f0\uacb0\ub429\ub2c8\ub2e4.": "Connection has been terminated since you have been idle for a while. Press OK button to reconnect.",
        "\uc800\uc7a5": "Save",
        "\uc81c\ucd9c": "Submit",
        "\ucc44\uc810": "Grade",
        "\ucc44\uc810 \uc644\ub8cc: \ud1b5\uacfc": "Grading Done: Passed",
        "\ucc44\uc810 \uc644\ub8cc: \ud1b5\uacfc \uc2e4\ud328": "Grading Done: Failed",
        "\ucc44\uc810 \uc911...": "Grading...",
        "\ucde8\uc18c": "Cancel",
        "\ucf54\ub4dc \ub9ac\uc14b": "Reset Code",
        "\ucf54\ub4dc \ucd08\uae30\ud654": "Reset Code",
        "\ucf54\ub4dc\ub97c \ub9ac\uc14b\ud560\uae4c\uc694? \uc218\uc815\ud558\uc2e0 \ubd80\ubd84\uc774 \ubaa8\ub450 \uc0ac\ub77c\uc9d1\ub2c8\ub2e4.": "Reset code? All of your modifications will be gone.",
        "\ud655\uc778": "OK"
    };
    for (var key in newcatalog) {
        django.catalog[key] = newcatalog[key];
    }


    if (!django.jsi18n_initialized) {
        django.gettext = function (msgid) {
            var value = django.catalog[msgid];
            if (typeof (value) == 'undefined') {
                return msgid;
            } else {
                return (typeof (value) == 'string') ? value : value[0];
            }
        };

        django.ngettext = function (singular, plural, count) {
            var value = django.catalog[singular];
            if (typeof (value) == 'undefined') {
                return (count == 1) ? singular : plural;
            } else {
                return value.constructor === Array ? value[django.pluralidx(count)] : value;
            }
        };

        django.gettext_noop = function (msgid) { return msgid; };

        django.pgettext = function (context, msgid) {
            var value = django.gettext(context + '\x04' + msgid);
            if (value.indexOf('\x04') != -1) {
                value = msgid;
            }
            return value;
        };

        django.npgettext = function (context, singular, plural, count) {
            var value = django.ngettext(context + '\x04' + singular, context + '\x04' + plural, count);
            if (value.indexOf('\x04') != -1) {
                value = django.ngettext(singular, plural, count);
            }
            return value;
        };

        django.interpolate = function (fmt, obj, named) {
            if (named) {
                return fmt.replace(/%\(\w+\)s/g, function (match) { return String(obj[match.slice(2, -2)]) });
            } else {
                return fmt.replace(/%s/g, function (match) { return String(obj.shift()) });
            }
        };


        /* formatting library */

        django.formats = {
            "DATETIME_FORMAT": "N j, Y, P",
            "DATETIME_INPUT_FORMATS": [
                "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%d %H:%M:%S.%f",
                "%Y-%m-%d %H:%M",
                "%Y-%m-%d",
                "%m/%d/%Y %H:%M:%S",
                "%m/%d/%Y %H:%M:%S.%f",
                "%m/%d/%Y %H:%M",
                "%m/%d/%Y",
                "%m/%d/%y %H:%M:%S",
                "%m/%d/%y %H:%M:%S.%f",
                "%m/%d/%y %H:%M",
                "%m/%d/%y"
            ],
            "DATE_FORMAT": "N j, Y",
            "DATE_INPUT_FORMATS": [
                "%Y-%m-%d",
                "%m/%d/%Y",
                "%m/%d/%y"
            ],
            "DECIMAL_SEPARATOR": ".",
            "FIRST_DAY_OF_WEEK": 0,
            "MONTH_DAY_FORMAT": "F j",
            "NUMBER_GROUPING": 3,
            "SHORT_DATETIME_FORMAT": "m/d/Y P",
            "SHORT_DATE_FORMAT": "m/d/Y",
            "THOUSAND_SEPARATOR": ",",
            "TIME_FORMAT": "P",
            "TIME_INPUT_FORMATS": [
                "%H:%M:%S",
                "%H:%M:%S.%f",
                "%H:%M"
            ],
            "YEAR_MONTH_FORMAT": "F Y"
        };

        django.get_format = function (format_type) {
            var value = django.formats[format_type];
            if (typeof (value) == 'undefined') {
                return format_type;
            } else {
                return value;
            }
        };

        /* add to global namespace */
        globals.pluralidx = django.pluralidx;
        globals.gettext = django.gettext;
        globals.ngettext = django.ngettext;
        globals.gettext_noop = django.gettext_noop;
        globals.pgettext = django.pgettext;
        globals.npgettext = django.npgettext;
        globals.interpolate = django.interpolate;
        globals.get_format = django.get_format;

        django.jsi18n_initialized = true;
    }

}(this));
