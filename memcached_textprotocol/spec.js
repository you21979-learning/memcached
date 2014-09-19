"use strict";

var MESSAGE_MARKER = exports.MESSAGE_MARKER = {
    SPLIT : ' ',
    END : '\r\n',
};

var CMD = exports.CMD = {
    GET:'get',
    SET:'set',
    DELETE:'delete',
    STATS:'stats',
};

var FLAGS = exports.FLAGS = {
    UNCOMPRESS : 0,
    COMPRESS : 1,
};

