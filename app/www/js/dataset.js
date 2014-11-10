// Generated by CoffeeScript 1.8.0
(function() {
  'use strict';
  var Dataset, datasetDisplay;

  Dataset = (function() {
    function Dataset(dir) {
      this.dir = dir;
    }

    Dataset.prototype.load = function(callback) {
      console.log('Loading dataset info...');
      this.loadInfo((function(_this) {
        return function() {
          console.log('Loading species data...');
          _this.loadSpeciesData(function() {
            console.log('Loading feature images...');
            _this.loadFeatureImages(function() {
              console.log('Loading species images...');
              _this.loadSpeciesImages(function() {
                console.log('Done loading!');
                callback();
              });
            });
          });
        };
      })(this));
    };

    Dataset.prototype.loadInfo = function(callback) {
      $.getJSON("" + this.dir + "/info.json", (function(_this) {
        return function(json) {
          _this.title = json.title, _this.id = json.id, _this.version = json.version, _this.description = json.description, _this.author = json.author;
          callback();
        };
      })(this));
    };

    Dataset.prototype.loadDirectory = function(json, dir, callback) {
      getJSONList(json, callback, (function(_this) {
        return function() {
          resolveLocalFileSystemURL(dir, function(dirEntry) {
            getAllFiles(dirEntry.createReader(), function(entries) {
              var entry, urls;
              urls = (function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = entries.length; _i < _len; _i++) {
                  entry = entries[_i];
                  _results.push(entry.toURL());
                }
                return _results;
              })();
              callback(urls);
            });
          }, function() {
            console.log("Tried to load from nonexistent folder: " + dir);
            callback([]);
          });
        };
      })(this));
    };

    Dataset.prototype.loadFeatureImages = function(callback) {
      this.featureImages = {};
      this.loadDirectory("" + this.dir + "/features.json", "" + this.dir + "/features/", (function(_this) {
        return function(images) {
          var image, _i, _len;
          for (_i = 0, _len = images.length; _i < _len; _i++) {
            image = images[_i];
            _this.addFeatureImage(image);
          }
          callback();
        };
      })(this));
    };

    Dataset.prototype.loadSpeciesImages = function(callback) {
      this.speciesImages = {};
      this.loadDirectory("" + this.dir + "/species.json", "" + this.dir + "/species/", (function(_this) {
        return function(images) {
          var image, _i, _len;
          for (_i = 0, _len = images.length; _i < _len; _i++) {
            image = images[_i];
            _this.addSpeciesImage(image);
          }
          callback();
        };
      })(this));
    };

    Dataset.prototype.addFeatureImage = function(url) {
      var feature, result, value, _base;
      url = decodeURI(url);
      if (url.match(/\.DS_Store$/)) {
        return;
      }
      result = url.match(/(?:^|\/)([\w \-]+)\/([\w \-]+)\.\w+$/);
      if (result != null) {
        feature = canonicalValue(result[1]);
        value = canonicalValue(result[2]);
        if ((_base = this.featureImages)[feature] == null) {
          _base[feature] = {};
        }
        this.featureImages[feature][value] = url;
        return;
      }
      console.log("Couldn't parse feature image: " + url);
    };

    Dataset.prototype.addSpeciesImage = function(url) {
      var label, name, result, _base, _base1;
      url = decodeURI(url);
      result = url.match(/(?:^|\/)([\w ]+)-([\w -]+)\.\w+$/);
      if (result != null) {
        name = canonicalValue(result[1]);
        label = canonicalValue(result[2]);
        if ((_base = this.speciesImages)[name] == null) {
          _base[name] = [];
        }
        this.speciesImages[name].push([label, url]);
        return;
      }
      result = url.match(/(?:^|\/)([\w ]+)\.\w+$/);
      if (result != null) {
        name = canonicalValue(result[1]);
        if ((_base1 = this.speciesImages)[name] == null) {
          _base1[name] = [];
        }
        this.speciesImages[name].push(['', url]);
        return;
      }
      console.log("Couldn't parse species image: " + url);
    };

    Dataset.prototype.loadSpeciesData = function(callback) {
      $.get("" + this.dir + "/species.csv", (function(_this) {
        return function(str) {
          var csvRow, spec, _i, _len, _ref;
          _this.species = {};
          _ref = $.parse(str).results.rows;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            csvRow = _ref[_i];
            spec = new Species(csvRow);
            _this.species[spec.name] = spec;
          }
          _this.listFeatures();
          callback();
        };
      })(this));
    };

    Dataset.prototype.listFeatures = function() {
      var feature, k, spec, value, values, _base, _i, _len, _ref, _ref1;
      this.features = {};
      _ref = this.species;
      for (k in _ref) {
        spec = _ref[k];
        _ref1 = spec.features;
        for (feature in _ref1) {
          values = _ref1[feature];
          if ((_base = this.features)[feature] == null) {
            _base[feature] = {};
          }
          for (_i = 0, _len = values.length; _i < _len; _i++) {
            value = values[_i];
            this.features[feature][value] = true;
          }
        }
      }
    };

    Dataset.prototype.imagesForSpecies = function(spec) {
      var _ref;
      return (_ref = this.speciesImages[canonicalValue(spec.name)]) != null ? _ref : [];
    };

    Dataset.prototype.imageForFeature = function(feature, value) {
      var _ref;
      return ((_ref = this.featureImages[canonicalValue(feature)]) != null ? _ref : {})[canonicalValue(value)];
    };

    return Dataset;

  })();

  datasetDisplay = function(obj) {
    return "" + obj.title + " v" + obj.version;
  };

  window.Dataset = Dataset;

  window.datasetDisplay = datasetDisplay;

}).call(this);