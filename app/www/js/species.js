// Generated by CoffeeScript 1.8.0
(function() {
  'use strict';
  var Species, comparisonValue, splitList,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  comparisonValue = function(value) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  splitList = function(value) {
    var v, _i, _len, _ref, _results;
    _ref = value.toString().split(',').map(function(x) {
      return x.trim();
    });
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      if (v.length !== 0) {
        _results.push(v);
      }
    }
    return _results;
  };

  Species = (function() {
    function Species(csvRow) {
      var k, v, _ref;
      this.csvRow = csvRow;
      this.features = {};
      for (k in csvRow) {
        v = csvRow[k];
        k = comparisonValue(k);
        switch (k) {
          case 'name':
            this.name = v.trim();
            break;
          case 'description':
            this.description = v.trim();
            break;
          case 'displayname':
            this.display_name = v.trim();
            break;
          default:
            this.features[k] = splitList(v).map(comparisonValue);
        }
      }
      if (!((_ref = this.display_name) != null ? _ref.length : void 0)) {
        this.display_name = this.name;
      }
    }

    Species.prototype.computeScore = function(selected) {
      var feature, overlap, score, v, values;
      score = 0;
      for (feature in selected) {
        values = selected[feature];
        overlap = (function() {
          var _results;
          _results = [];
          for (v in values) {
            if (__indexOf.call(this.features[feature], v) >= 0) {
              _results.push(v);
            }
          }
          return _results;
        }).call(this);
        if (overlap.length !== 0) {
          score++;
        }
      }
      return score;
    };

    return Species;

  })();

  window.Species = Species;

  window.comparisonValue = comparisonValue;

  window.splitList = splitList;

}).call(this);
