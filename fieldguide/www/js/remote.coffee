'use strict'

class Remote
  constructor: (@datadir, @url) ->
    @list = "#{@datadir}/remote.json"

  downloadList: (callback, errback) ->
    transfer = new FileTransfer()
    transfer.download @url, @list, (entry) =>
      $.getJSON @list, (json) =>
        @datasets = json
        callback()
    , errback

  downloadDataset: (id, lib, callback) ->
    match =
      set for set in @datasets when set.id is id
    alert "Couldn't find dataset in remote list: #{id}" unless match[0]?
    zipFile = "#{@datadir}/#{id}.zip"
    transfer = new FileTransfer()
    transfer.download match[0].url, zipFile, (zipEntry) =>
      lib.makeSet id, (setEntry) =>
        zip.unzip zipFile, setEntry.toURL(), (code) =>
          zipEntry.remove =>
            unless code is 0
              alert "Unzip operation on #{zipFile} returned #{code}"
            callback()

window.Remote = Remote
