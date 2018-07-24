let debugFunc = function(a: any) {
};

try {
    if (typeof eval('debug') !== 'undefined') {
        debugFunc = eval('debug')("hemtjanst");
    }
} catch (err) {}

let logger = {
    log: console.log,
    debug: debugFunc,
    setLogFunc: function(func: (a: any, b?: any) => any) {
        logger.log = func;
    },
    setDebugFunc: function(func: (a: any) => any) {
        logger.debug = func;
    }
};

export = logger;