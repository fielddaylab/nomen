// Generated by CoffeeScript 1.7.1
(function() {
  'use strict';
  var Species, canonicalValue, displayValue, parseList,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  parseList = function(str) {
    var val, _i, _len, _ref, _results;
    _ref = str.toString().split(',');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      val = _ref[_i];
      val = canonicalValue(val);
      if (val.length === 0) {
        continue;
      }
      _results.push(val);
    }
    return _results;
  };

  canonicalValue = function(value) {
    return value.trim().toLowerCase().split(' ').join('_');
  };

  displayValue = function(value) {
    var word, words;
    if (value.length === 0) {
      return '';
    } else {
      words = (function() {
        var _i, _len, _ref, _results;
        _ref = value.split('_');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          word = _ref[_i];
          _results.push(word[0].toUpperCase() + word.slice(1));
        }
        return _results;
      })();
      return words.join(' ');
    }
  };

  Species = (function() {
    function Species(csvRow) {
      var k, reachedFeatures, v;
      this.name = csvRow.name;
      this.description = csvRow.description;
      this.display_name = csvRow.display_name;
      if (this.display_name.length === 0) {
        this.display_name = this.name;
      }
      this.features = {};
      reachedFeatures = false;
      for (k in csvRow) {
        v = csvRow[k];
        k = canonicalValue(k);
        if (k === 'name' || k === 'display_name' || k === 'description') {
          continue;
        }
        this.features[k] = parseList(v);
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

  window.displayValue = displayValue;

  window.canonicalValue = canonicalValue;

}).call(this);
