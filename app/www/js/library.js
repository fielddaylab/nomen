// Generated by CoffeeScript 1.8.0
(function() {
  'use strict';
  var Library;

  Library = (function() {
    function Library(datadir) {
      this.datadir = datadir;
      this.dir = "" + this.datadir + "/library";
      this.json = "" + this.datadir + "/library.json";
    }

    Library.prototype.makeDir = function(callback) {
      resolveLocalFileSystemURL(this.datadir, (function(_this) {
        return function(dir) {
          dir.getDirectory('library', {
            create: true
          }, function() {
            callback();
          });
        };
      })(this));
    };

    Library.prototype.deleteDir = function(callback) {
      resolveLocalFileSystemURL(this.dir, (function(_this) {
        return function(dir) {
          dir.removeRecursively(callback);
        };
      })(this), callback);
    };

    Library.prototype.deleteSet = function(id, callback) {
      resolveLocalFileSystemURL("" + this.dir + "/" + id, (function(_this) {
        return function(dir) {
          dir.removeRecursively(callback);
        };
      })(this), callback);
    };

    Library.prototype.makeSet = function(id, callback) {
      this.deleteSet(id, (function(_this) {
        return function() {
          resolveLocalFileSystemURL(_this.dir, function(dir) {
            dir.getDirectory(id, {
              create: true
            }, function(dirEntry) {
              callback(dirEntry);
            });
          });
        };
      })(this));
    };

    Library.prototype.scanLibrary = function(callback) {
      var processDirs;
      this.datasets = {};
      processDirs = (function(_this) {
        return function(urls) {
          if (urls.length === 0) {
            callback();
          } else {
            _this.addLibrary(resolveURI(_this.json, urls.pop()), function() {
              return processDirs(urls);
            });
          }
        };
      })(this);
      getJSONList(this.json, processDirs, (function(_this) {
        return function() {
          resolveLocalFileSystemURL(_this.dir, function(dirEntry) {
            var dirReader;
            dirReader = dirEntry.createReader();
            getSubdirs(dirEntry.createReader(), function(dirs) {
              var dir;
              processDirs((function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = dirs.length; _i < _len; _i++) {
                  dir = dirs[_i];
                  _results.push(dir.toURL());
                }
                return _results;
              })());
            });
          }, callback);
        };
      })(this));
    };

    Library.prototype.addLibrary = function(url, callback) {
      var ds;
      ds = new Dataset(url);
      ds.loadInfo((function(_this) {
        return function() {
          _this.datasets[ds.id] = ds;
          callback();
        };
      })(this));
    };

    return Library;

  })();

  window.Library = Library;

}).call(this);