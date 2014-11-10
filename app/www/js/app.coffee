###
App-o-Mat jQuery Mobile Cordova starter template
https://github.com/app-o-mat/jqm-cordova-template-project
http://app-o-mat.com

MIT License
https://github.com/app-o-mat/jqm-cordova-template-project/LICENSE.md
###

'use strict'

# Shortcut for
# 1. using CoffeeMugg to generate some HTML
# 2. appending it to a JQuery element
# 3. directing JQuery Mobile to perform any appearance triggers
#    (for example restyling links into buttons, etc.)
appendTo = (element, muggexpr) ->>
  element.append( CoffeeMugg.render(muggexpr, format: no) ).trigger('create')

class App
  constructor: (readWriteDir, readOnlyDir, remoteURL) ->
    # Library stored in read/write storage, data downloaded from remote
    @library =
      if readWriteDir? then new Library readWriteDir else null
    # Library stored inside the app, read-only
    @libraryStatic =
      if readOnlyDir? then new Archive readOnlyDir else null
    @remote =
      if readWriteDir? and remoteURL?
        new Remote readWriteDir, remoteURL
      else
        null
    unless readWriteDir?
      $('#clear-button').addClass 'ui-state-disabled'
    unless readWriteDir? and remoteURL?
      $('#download-button').addClass 'ui-state-disabled'

  # Called after all the Cordova APIs are ready.
  onDeviceReady: ->>
    FastClick.attach document.body
    @resizeImage()
    $(window).resize => @resizeImage()
    @refreshLibrary()

  # Syncs the list of remote datasets, and updates the buttons accordingly.
  syncRemote: (button, callback = (->)) ->>
    button.addClass 'ui-state-disabled'
    button.text 'Syncing...'
    @remote.downloadList =>>
      @clearRemoteButtons()
      for dataset in @remote.datasets
        @addRemoteButton dataset
      setTimeout =>>
        button.text 'Synced'
        button.removeClass 'ui-state-disabled'
      , 250 # For user-friendliness, we show "Syncing..." for at least 250ms
      callback()
    , =>>
      setTimeout =>>
        button.text 'Sync failed'
        button.removeClass 'ui-state-disabled'
      , 250

  # Clear all buttons for remotely available datasets.
  clearRemoteButtons: ->>
    $('#remote-content').text ''

  # Add a button for a new downloadable dataset to the Download page.
  addRemoteButton: (dataset) ->>
    setFn = "app.downloadZip($(this), '#{dataset.id}');"
    appendTo $('#remote-content'), ->>
      @a '.ui-btn .remote-button', onclick: setFn, datasetDisplay dataset
      @p dataset.description or 'No description.'

  # Download a dataset from the remote, unzip it, and add a button for it to the
  # home screen (by calling refreshLibrary).
  downloadZip: (button, id, callback = (->)) ->>
    dataset = @remote.getDataset id
    setname = datasetDisplay dataset
    button.addClass 'ui-state-disabled'
    button.text "Downloading: #{setname}"
    @library.makeDir =>>
      @remote.downloadDataset id, @library, =>>
        button.text setname
        button.removeClass 'ui-state-disabled'
        @refreshLibrary callback
      , =>>
        setTimeout =>>
          button.text "Failed: #{setname}"
          button.removeClass 'ui-state-disabled'
        , 250

  # Sets up and loads the delete confirmation dialog for clearing the library.
  readyClear: ->>
    $('#confirm-delete-message').text 'Are you sure you want to delete all guides?'
    @deleteAction = (callback) =>>
      @clearLibrary callback
    $.mobile.changePage '#confirm-delete', { transition: 'pop' }

  # Sets up and loads the delete confirmation dialog for deleting a single set.
  readyDelete: (id) ->>
    title = @library.datasets[id].title
    $('#confirm-delete-message').text "Are you sure you want to delete the \"#{title}\" guide?"
    @deleteAction = (callback) =>>
      @deleteDataset id, callback
    $.mobile.changePage '#confirm-delete', { transition: 'pop' }

  # Performs a delete action after the user confirms it from the dialog.
  proceedDelete: (callback = (->)) ->>
    @deleteAction =>>
      $.mobile.changePage '#home', { transition: 'pop', reverse: true }
      callback()

  # Delete all datasets from the file system, by removing the whole library
  # folder recursively.
  clearLibrary: (callback = (->)) ->>
    @library.deleteDir =>>
      @refreshLibrary callback

  # Ensure the buttons on the home screen accurately reflect the datasets
  # we have in the file system.
  refreshLibrary: (callback = (->)) ->>
    @clearDataButtons()
    scanStatic = =>>
      if @libraryStatic?
        @libraryStatic.scanLibrary =>>
          for id, dataset of @libraryStatic.datasets
            @addDataButton dataset, false
          callback()
      else
        callback()
    if @library?
      @library.scanLibrary =>>
        for id, dataset of @library.datasets
          @addDataButton dataset, true
        scanStatic()
    else
      scanStatic()

  # Delete the dataset with the given ID from the device's file system.
  # Also deletes the button by calling refreshLibrary.
  deleteDataset: (id, callback = (->)) ->>
    @library.deleteSet id, =>>
      @refreshLibrary callback

  # Clear any existing dataset buttons on the home screen.
  clearDataButtons: ->>
    $('#home-content').text ''

  # Add a button for a new dataset to the home screen.
  addDataButton: (dataset, canDelete) ->>
    setFn = "app.goToDataset('#{dataset.id}');"
    deleteFn = "app.readyDelete('#{dataset.id}');"
    appendTo $('#home-content'), ->>
      if canDelete
        @a '.ui-btn .ui-btn-inline .ui-icon-delete .ui-btn-icon-notext', onclick: deleteFn, 'Delete'
      @a '.ui-btn .ui-btn-inline', onclick: setFn, datasetDisplay dataset
      @p dataset.description or 'No description.'

  # Loads a dataset, and then goes to the feature selection page.
  goToDataset: (id, callback = (->)) ->>
    @setDataset id, =>>
      $.mobile.changePage $('#dataset')
      callback()

  # Executed when the user opens a dataset from the home screen.
  setDataset: (id, callback = (->)) ->>
    @dataset = @library?.datasets[id] ? @libraryStatic?.datasets[id]
    @dataset.load =>>
      # Compares two strings by
      # 1. comparing numbers if they both start with a number
      # 2. otherwise, or if they start with equal numbers, lexicographically
      naturalSort = (a, b) ->
        matchNum = (x) -> x.toString().match /^([0-9]+)(.*)$/
        [__, anum, arest] = matchNum(a) ? [null, Infinity, a]
        [__, bnum, brest] = matchNum(b) ? [null, Infinity, b]
        if anum == bnum
          arest.localeCompare brest
        else
          anum - bnum
      @featureRows = for feature, values of @dataset.features
        for value in Object.keys(values).sort(naturalSort)
          display: displayValue value
          image: @dataset.imageForFeature(feature, value) ? 'img/noimage.png'
          feature: feature
          value: value
      $('#dataset-header').text @dataset.title
      @makeFeatureRows()
      @showHowMany()
      @fillLikelyPage()
      callback()

  # Fill the features page with rows of possible filtering criteria.
  makeFeatureRows: ->>
    $('#dataset-content').text ''
    for row in @featureRows
      feature = row[0].feature
      appendTo $('#dataset-content'), ->>
        @div '.feature-row', ->>
          @div '.feature-name', displayValue feature
          @div '.feature-boxes', ->>
            for {display, image, value} in row
              toggleFn = "app.toggleElement(this, '#{feature}', '#{value}');"
              @div '.feature-box', onclick: toggleFn, ->>
                @div '.feature-img-box', ->>
                  @img '.feature-img', src: image
                @div '.feature-value', display
    @selected = {}
    $('.feature-value').removeClass 'selected'

  # Toggle a feature-value's selection (both in the app, and in appearance).
  toggleElement: (element, feature, value) ->>
    @selected[feature] ?= {}

    if @selected[feature][value]
      delete @selected[feature][value]
    else
      @selected[feature][value] = true

    if Object.keys(@selected[feature]).length is 0
      delete @selected[feature]

    box = $(element)
    if box.hasClass 'selected'
      box.removeClass 'selected'
    else
      box.addClass 'selected'

    @showHowMany()
    @fillLikelyPage()

  # Update the "X Likely" button in the upper-right of the features page.
  showHowMany: ->>
    $('#likely-button').text "#{@getLikely().length} Likely"

  # Compute how many species match the criteria the user selected.
  getLikely: ->
    maxScore = Object.keys(@selected).length
    cutoff = maxScore
    spec for __, spec of @dataset.species when spec.computeScore(@selected) >= cutoff

  # Fill the "likely" page with rows of species images.
  fillLikelyPage: ->>
    $('#likely-species').text ''
    species =
      [spec, spec.computeScore(@selected)] for __, spec of @dataset.species
    maxScore = Object.keys(@selected).length
    if maxScore > 0
      species =
        [spec, score] for [spec, score] in species when score > 0
      species.sort ([spec1, score1], [spec2, score2]) ->
        score2 - score1 # sorts by score descending
    @speciesPending = species
    @showSpecies()

  # Add some more species to the list of likely candidates.
  showSpecies: ->>
    toShow = @speciesPending[0..9]
    @speciesPending = @speciesPending[10..]
    if @speciesPending.length is 0
      $('#likely-show-button').addClass 'ui-state-disabled'
    else
      $('#likely-show-button').removeClass 'ui-state-disabled'
    dataset = @dataset
    for [spec, score] in toShow
      appendTo $('#likely-species'), ->>
        setFn = "app.setSpecies('#{spec.name}'); return true;"
        @a '.to-species', href: '#specimen0', 'data-transition': 'slide', onclick: setFn, ->>
          @div '.feature-row', ->>
            @div '.feature-name', ->>
              @text "#{spec.display_name} (#{score})"
            @div '.feature-boxes', ->>
              pics = dataset.imagesForSpecies spec
              if pics.length is 0
                @div '.feature-box', ->>
                  @div '.feature-img-box', ->>
                    @img '.feature-img', src: 'img/noimage.png'
                  @div '.feature-value', 'No Image'
              else
                for [part, image], ix in pics
                  @a href: "#specimen#{ix}", 'data-transition': 'slide', onclick: setFn, ->>
                    @div '.feature-box', ->>
                      @div '.feature-img-box', ->>
                        @img '.feature-img', src: image
                      @div '.feature-value', ->>
                        txt = displayValue part
                        if txt
                          @text txt
                        else
                          @raw '&nbsp;'

  # Executed when the user clicks on a species button from the "likely" page.
  # Clear existing species pages, and make new ones for the selected species.
  setSpecies: (name) ->>
    @clearPages()
    spec = @dataset.species[name]
    pics = @dataset.imagesForSpecies spec
    if pics.length is 0
      @addPage spec.display_name, 'img/noimage.png', spec.description, 0
    else
      for [part, image], ix in pics
        @addPage spec.display_name, image, spec.description, ix
    @resizeImage()
    @addSwipes pics.length

  # Remove all the current JQuery Mobile pages for species images.
  clearPages: ->>
    i = 0
    loop
      page = $("#specimen#{i}")
      return if page.length is 0
      page.remove()
      i++

  # Add a JQuery Mobile page containing one of a species' images.
  addPage: (name, img, desc, ix) ->>
    img = encodeURI img
    appendTo $('body'), ->>
      @div "#specimen#{ix} .specimen", 'data-role': 'page', ->>
        @div 'data-role': 'header', 'data-position': 'fixed', 'data-tap-toggle': 'false', ->>
          @h1 name
          @a '.ui-btn-left', 'href': '#likely', 'data-icon': 'arrow-l', 'data-transition': 'slide', 'data-direction': 'reverse', 'Back'
        @div '.ui-content .specimen-content', 'data-role': 'main', ->>
          @div '.specimen-img-box', ->>
            @div '.specimen-img', style: "background-image: url(#{img});", ''
            @div '.specimen-img .blur', style: "background-image: url(#{img});", ''
            @div '.specimen-img-gradient', ''
          @div '.specimen-text-box', ->>
            @div '.specimen-text', desc

  # Add swipe handlers to the image pages, so you can swipe left and right
  # to move through a species' images.
  addSwipes: (imgs) ->>
    if imgs >= 2
      for ix in [0 .. imgs - 2]
        do (ix) ->>
          $("#specimen#{ix} .specimen-img-box").on 'swipeleft', ->>
            # swipeleft means move one image over to the right
            $.mobile.changePage "#specimen#{ix + 1}", { transition: "slide" }
      for ix in [1 .. imgs - 1]
        do (ix) ->>
          $("#specimen#{ix} .specimen-img-box").on 'swiperight', ->>
            # swiperight means move one image over to the left
            $.mobile.changePage "#specimen#{ix - 1}", { transition: "slide", reverse: true }

  # Dynamically resize the species images so they roughly fill the screen.
  # This gets called whenever a new species is selected (after its image pages
  # are added), or whenever the window is resized (e.g. device is rotated),
  # see `onDeviceReady`.
  resizeImage: ->>
    h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    $('.specimen-img-box').css('height', "#{h - 100}px")

window.App = App