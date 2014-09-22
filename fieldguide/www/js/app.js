// Generated by CoffeeScript 1.7.1

/*
App-o-Mat jQuery Mobile Cordova starter template
https://github.com/app-o-mat/jqm-cordova-template-project
http://app-o-mat.com

MIT License
https://github.com/app-o-mat/jqm-cordova-template-project/LICENSE.md
 */

(function() {
  'use strict';
  var App, appendTo;

  appendTo = function(element, muggexpr) {
    return element.append(CoffeeMugg.render(muggexpr, {
      format: false
    })).trigger('create');
  };

  App = (function() {
    function App(_arg) {
      this.datadir = _arg.datadir, this.appdir = _arg.appdir;
      this.library = new Library(this.datadir);
      this.libraryStatic = new Library("" + this.appdir + "/www");
      this.remote = new Remote(this.datadir, 'http://localhost:8888/EIFieldResearch/fieldguide/list.json');
    }

    App.prototype.onDeviceReady = function() {
      FastClick.attach(document.body);
      this.resizeImage();
      $(window).resize((function(_this) {
        return function() {
          return _this.resizeImage();
        };
      })(this));
      return this.refreshLibrary();
    };

    App.prototype.syncRemote = function(button, callback) {
      if (callback == null) {
        callback = (function() {});
      }
      button.addClass('ui-state-disabled');
      button.html('Syncing...');
      return this.remote.downloadList((function(_this) {
        return function() {
          var dataset, _i, _len, _ref;
          _this.clearRemoteButtons();
          _ref = _this.remote.datasets;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            dataset = _ref[_i];
            _this.addRemoteButton(dataset.id, datasetDisplay(dataset));
          }
          setTimeout(function() {
            button.html('Synced');
            return button.removeClass('ui-state-disabled');
          }, 250);
          return callback();
        };
      })(this), (function(_this) {
        return function() {
          return setTimeout(function() {
            button.html('Sync failed');
            return button.removeClass('ui-state-disabled');
          }, 250);
        };
      })(this));
    };

    App.prototype.clearRemoteButtons = function() {
      return $('#remote-content').html('');
    };

    App.prototype.addRemoteButton = function(id, text) {
      var setFn;
      setFn = "app.downloadZip($(this), '" + id + "');";
      return appendTo($('#remote-content'), function() {
        return this.a('.ui-btn .remote-button', {
          onclick: setFn
        }, text);
      });
    };

    App.prototype.downloadZip = function(button, id, callback) {
      var dataset, setname;
      if (callback == null) {
        callback = (function() {});
      }
      dataset = this.remote.getDataset(id);
      setname = datasetDisplay(dataset);
      button.addClass('ui-state-disabled');
      button.html("Downloading: " + setname);
      return this.library.makeDir((function(_this) {
        return function() {
          return _this.remote.downloadDataset(id, _this.library, function() {
            button.html(setname);
            button.removeClass('ui-state-disabled');
            return _this.refreshLibrary(callback);
          }, function() {
            return setTimeout(function() {
              button.html("Failed: " + setname);
              return button.removeClass('ui-state-disabled');
            }, 250);
          });
        };
      })(this));
    };

    App.prototype.readyClear = function() {
      console.log(this.appdir);
      $('#confirm-delete-message').html('Are you sure you want to clear the library?');
      this.deleteAction = (function(_this) {
        return function(callback) {
          return _this.clearLibrary(callback);
        };
      })(this);
      return $.mobile.changePage('#confirm-delete', {
        transition: 'pop'
      });
    };

    App.prototype.readyDelete = function(id) {
      var title;
      title = this.library.datasets[id].title;
      $('#confirm-delete-message').html("Are you sure you want to delete the dataset \"" + title + "\"?");
      this.deleteAction = (function(_this) {
        return function(callback) {
          return _this.deleteDataset(id, callback);
        };
      })(this);
      return $.mobile.changePage('#confirm-delete', {
        transition: 'pop'
      });
    };

    App.prototype.proceedDelete = function(callback) {
      if (callback == null) {
        callback = (function() {});
      }
      return this.deleteAction((function(_this) {
        return function() {
          $.mobile.changePage('#home', {
            transition: 'pop',
            reverse: true
          });
          return callback();
        };
      })(this));
    };

    App.prototype.clearLibrary = function(callback) {
      if (callback == null) {
        callback = (function() {});
      }
      return this.library.deleteDir((function(_this) {
        return function() {
          return _this.refreshLibrary(callback);
        };
      })(this));
    };

    App.prototype.refreshLibrary = function(callback) {
      if (callback == null) {
        callback = (function() {});
      }
      this.clearDataButtons();
      return this.library.scanLibrary((function(_this) {
        return function() {
          var dataset, id, _ref;
          _ref = _this.library.datasets;
          for (id in _ref) {
            dataset = _ref[id];
            _this.addDataButton(id, datasetDisplay(dataset), true);
          }
          return _this.libraryStatic.scanLibrary(function() {
            var _ref1;
            _ref1 = _this.libraryStatic.datasets;
            for (id in _ref1) {
              dataset = _ref1[id];
              _this.addDataButton(id, datasetDisplay(dataset), false);
            }
            return callback();
          });
        };
      })(this));
    };

    App.prototype.deleteDataset = function(id, callback) {
      if (callback == null) {
        callback = (function() {});
      }
      return this.library.deleteSet(id, (function(_this) {
        return function() {
          return _this.refreshLibrary(callback);
        };
      })(this));
    };

    App.prototype.clearDataButtons = function() {
      return $('#home-content').html('');
    };

    App.prototype.addDataButton = function(id, text, canDelete) {
      var deleteFn, setFn;
      setFn = "app.goToDataset('" + id + "');";
      deleteFn = "app.readyDelete('" + id + "');";
      return appendTo($('#home-content'), function() {
        if (canDelete) {
          this.a('.ui-btn .ui-btn-inline .ui-icon-delete .ui-btn-icon-notext', {
            onclick: deleteFn
          }, 'Delete');
        }
        this.a('.ui-btn .ui-btn-inline', {
          onclick: setFn
        }, text);
        return this.br('');
      });
    };

    App.prototype.goToDataset = function(id, callback) {
      if (callback == null) {
        callback = (function() {});
      }
      return this.setDataset(id, (function(_this) {
        return function() {
          $.mobile.changePage($('#dataset'));
          return callback();
        };
      })(this));
    };

    App.prototype.setDataset = function(id, callback) {
      var _ref;
      if (callback == null) {
        callback = (function() {});
      }
      this.dataset = (_ref = this.library.datasets[id]) != null ? _ref : this.libraryStatic.datasets[id];
      return this.dataset.load((function(_this) {
        return function() {
          var feature, naturalSort, value, values;
          naturalSort = function(a, b) {
            var anum, arest, bnum, brest, matchNum, __, _ref1, _ref2, _ref3, _ref4;
            matchNum = function(x) {
              return x.toString().match(/^([0-9]+)(.*)$/);
            };
            _ref2 = (_ref1 = matchNum(a)) != null ? _ref1 : [null, Infinity, a], __ = _ref2[0], anum = _ref2[1], arest = _ref2[2];
            _ref4 = (_ref3 = matchNum(b)) != null ? _ref3 : [null, Infinity, b], __ = _ref4[0], bnum = _ref4[1], brest = _ref4[2];
            if (anum === bnum) {
              return arest.localeCompare(brest);
            } else {
              return anum - bnum;
            }
          };
          _this.featureRows = (function() {
            var _ref1, _results;
            _ref1 = this.dataset.features;
            _results = [];
            for (feature in _ref1) {
              values = _ref1[feature];
              _results.push((function() {
                var _i, _len, _ref2, _ref3, _ref4, _results1;
                _ref2 = Object.keys(values).sort(naturalSort);
                _results1 = [];
                for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                  value = _ref2[_i];
                  _results1.push({
                    display: displayValue(value),
                    image: (_ref3 = (_ref4 = this.dataset.imageForFeature(feature, value)) != null ? _ref4.toURL() : void 0) != null ? _ref3 : 'img/noimage.png',
                    feature: feature,
                    value: value
                  });
                }
                return _results1;
              }).call(this));
            }
            return _results;
          }).call(_this);
          $('#dataset-header').html(_this.dataset.title);
          _this.makeFeatureRows();
          _this.showHowMany();
          _this.fillLikelyPage();
          return callback();
        };
      })(this));
    };

    App.prototype.makeFeatureRows = function() {
      var feature, row, _i, _len, _ref;
      $('#dataset-content').html('');
      _ref = this.featureRows;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        feature = row[0].feature;
        appendTo($('#dataset-content'), function() {
          return this.div('.feature-row', function() {
            this.div('.feature-name', displayValue(feature));
            return this.div('.feature-boxes', function() {
              var display, image, toggleFn, value, _j, _len1, _ref1, _results;
              _results = [];
              for (_j = 0, _len1 = row.length; _j < _len1; _j++) {
                _ref1 = row[_j], display = _ref1.display, image = _ref1.image, value = _ref1.value;
                toggleFn = "app.toggleElement(this, '" + feature + "', '" + value + "');";
                _results.push(this.div('.feature-box', {
                  onclick: toggleFn
                }, function() {
                  this.img('.feature-img', {
                    src: image
                  });
                  return this.div('.feature-value', display);
                }));
              }
              return _results;
            });
          });
        });
      }
      this.selected = {};
      return $('.feature-value').removeClass('selected');
    };

    App.prototype.toggleElement = function(element, feature, value) {
      var _base;
      if ((_base = this.selected)[feature] == null) {
        _base[feature] = {};
      }
      if (this.selected[feature][value]) {
        delete this.selected[feature][value];
      } else {
        this.selected[feature][value] = true;
      }
      if (Object.keys(this.selected[feature]).length === 0) {
        delete this.selected[feature];
      }
      value = $(element).find('.feature-value');
      if (value.hasClass('selected')) {
        value.removeClass('selected');
      } else {
        value.addClass('selected');
      }
      this.showHowMany();
      return this.fillLikelyPage();
    };

    App.prototype.showHowMany = function() {
      return $('#likely-button').html("" + (this.getLikely().length) + " Likely");
    };

    App.prototype.getLikely = function() {
      var cutoff, maxScore, spec, __, _ref, _results;
      maxScore = Object.keys(this.selected).length;
      cutoff = maxScore;
      _ref = this.dataset.species;
      _results = [];
      for (__ in _ref) {
        spec = _ref[__];
        if (spec.computeScore(this.selected) >= cutoff) {
          _results.push(spec);
        }
      }
      return _results;
    };

    App.prototype.fillLikelyPage = function() {
      var maxScore, score, spec, species, __;
      $('#likely-species').html('');
      species = (function() {
        var _ref, _results;
        _ref = this.dataset.species;
        _results = [];
        for (__ in _ref) {
          spec = _ref[__];
          _results.push([spec, spec.computeScore(this.selected)]);
        }
        return _results;
      }).call(this);
      maxScore = Object.keys(this.selected).length;
      if (maxScore > 0) {
        species = (function() {
          var _i, _len, _ref, _results;
          _results = [];
          for (_i = 0, _len = species.length; _i < _len; _i++) {
            _ref = species[_i], spec = _ref[0], score = _ref[1];
            if (score > 0) {
              _results.push([spec, score]);
            }
          }
          return _results;
        })();
        species.sort(function(_arg, _arg1) {
          var score1, score2, spec1, spec2;
          spec1 = _arg[0], score1 = _arg[1];
          spec2 = _arg1[0], score2 = _arg1[1];
          return score2 - score1;
        });
      }
      this.speciesPending = species;
      return this.showSpecies();
    };

    App.prototype.showSpecies = function() {
      var dataset, score, spec, toShow, _i, _len, _ref, _results;
      toShow = this.speciesPending.slice(0, 10);
      this.speciesPending = this.speciesPending.slice(10);
      if (this.speciesPending.length === 0) {
        $('#likely-show-button').addClass('ui-state-disabled');
      } else {
        $('#likely-show-button').removeClass('ui-state-disabled');
      }
      dataset = this.dataset;
      _results = [];
      for (_i = 0, _len = toShow.length; _i < _len; _i++) {
        _ref = toShow[_i], spec = _ref[0], score = _ref[1];
        _results.push(appendTo($('#likely-species'), function() {
          var setFn;
          setFn = "app.setSpecies('" + spec.name + "'); return true;";
          return this.a({
            href: '#specimen0',
            'data-transition': 'slide',
            onclick: setFn
          }, function() {
            return this.div('.feature-row', function() {
              this.div('.feature-name', function() {
                return this.text("" + spec.display_name + " (" + score + ")");
              });
              return this.div('.feature-boxes', function() {
                var image, ix, part, pics, _j, _len1, _ref1, _results1;
                pics = dataset.imagesForSpecies(spec);
                if (pics.length === 0) {
                  return this.div('.feature-box', function() {
                    this.img('.feature-img', {
                      src: 'img/noimage.png'
                    });
                    return this.div('.feature-value', 'No Image');
                  });
                } else {
                  _results1 = [];
                  for (ix = _j = 0, _len1 = pics.length; _j < _len1; ix = ++_j) {
                    _ref1 = pics[ix], part = _ref1[0], image = _ref1[1];
                    _results1.push(this.a({
                      href: "#specimen" + ix,
                      'data-transition': 'slide',
                      onclick: setFn
                    }, function() {
                      return this.div('.feature-box', function() {
                        this.img('.feature-img', {
                          src: image.toURL()
                        });
                        return this.div('.feature-value', displayValue(part));
                      });
                    }));
                  }
                  return _results1;
                }
              });
            });
          });
        }));
      }
      return _results;
    };

    App.prototype.setSpecies = function(name) {
      var image, ix, part, pics, spec, _i, _len, _ref;
      this.clearPages();
      spec = this.dataset.species[name];
      pics = this.dataset.imagesForSpecies(spec);
      if (pics.length === 0) {
        this.addPage(spec.display_name, 'img/noimage.png', spec.description, 0);
      } else {
        for (ix = _i = 0, _len = pics.length; _i < _len; ix = ++_i) {
          _ref = pics[ix], part = _ref[0], image = _ref[1];
          this.addPage(spec.display_name, image.toURL(), spec.description, ix);
        }
      }
      this.resizeImage();
      return this.addSwipes(pics.length);
    };

    App.prototype.clearPages = function() {
      var i, page;
      i = 0;
      while (true) {
        page = $("#specimen" + i);
        if (page.length === 0) {
          return;
        }
        page.remove();
        i++;
      }
    };

    App.prototype.addPage = function(name, img, desc, ix) {
      return appendTo($('body'), function() {
        return this.div("#specimen" + ix + " .specimen", {
          'data-role': 'page'
        }, function() {
          this.div({
            'data-role': 'header',
            'data-position': 'fixed',
            'data-tap-toggle': 'false'
          }, function() {
            this.h1(name);
            return this.a('.ui-btn-left', {
              'href': '#likely',
              'data-icon': 'arrow-l',
              'data-transition': 'slide',
              'data-direction': 'reverse'
            }, 'Back');
          });
          return this.div('.ui-content .specimen-content', {
            'data-role': 'main'
          }, function() {
            this.div('.specimen-img-box', function() {
              this.div('.specimen-img', {
                style: "background-image: url(" + img + ");"
              }, '');
              this.div('.specimen-img .blur', {
                style: "background-image: url(" + img + ");"
              }, '');
              return this.div('.specimen-img-gradient', '');
            });
            return this.div('.specimen-text-box', function() {
              return this.div('.specimen-text', desc);
            });
          });
        });
      });
    };

    App.prototype.addSwipes = function(imgs) {
      var ix, _fn, _i, _j, _ref, _ref1, _results;
      if (imgs >= 2) {
        _fn = function(ix) {
          return $("#specimen" + ix + " .specimen-img-box").on('swipeleft', function() {
            return $.mobile.changePage("#specimen" + (ix + 1), {
              transition: "slide"
            });
          });
        };
        for (ix = _i = 0, _ref = imgs - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; ix = 0 <= _ref ? ++_i : --_i) {
          _fn(ix);
        }
        _results = [];
        for (ix = _j = 1, _ref1 = imgs - 1; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; ix = 1 <= _ref1 ? ++_j : --_j) {
          _results.push((function(ix) {
            return $("#specimen" + ix + " .specimen-img-box").on('swiperight', function() {
              return $.mobile.changePage("#specimen" + (ix - 1), {
                transition: "slide",
                reverse: true
              });
            });
          })(ix));
        }
        return _results;
      }
    };

    App.prototype.resizeImage = function() {
      var h;
      h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      return $('.specimen-img-box').css('height', "" + (h - 100) + "px");
    };

    return App;

  })();

  window.App = App;

}).call(this);
