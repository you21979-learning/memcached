"use strict";

var MESSAGE_MARKER = exports.MESSAGE_MARKER = {
    SPLIT : ' ',
    END : '\r\n',
};

var CMD = exports.CMD = {
    DELETE:'delete',
    SET:'set',
    GET:'get',
    INC:'incr',
    DEC:'decr',
    PREPEND:'prepend',
    APPEND:'append',
    STATS:'stats',
};

var FLAGS = exports.FLAGS = {
    UNCOMPRESS : 0,
    COMPRESS : 1,
};

