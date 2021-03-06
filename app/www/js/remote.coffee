'use strict'

class Remote
  constructor: (@datadir, @url) ->
    @list = "#{@datadir}/remote.json"

  getDataset: (id) ->
    return set for set in @datasets when set.id is id
    null

  downloadList: (callback, errback) ->>
    transfer = new FileTransfer()
    transfer.download @url, @list, (entry) =>>
      $.getJSON @list, (json) =>>
        @datasets = json
        for set in @datasets
          if set.icon?
            set.icon = resolveURI @url, set.icon
        callback()
    , errback

  downloadDataset: (id, lib, callback, errback, progback) ->>
    dataset = @getDataset id
    unless dataset?
      errback "Couldn't find dataset: #{id}"
      return
    zipFile = "#{@datadir}/#{id}.zip"
    transfer = new FileTransfer()
    transfer.onprogress = progback
    absoluteUrl = resolveURI @url, dataset.url
    transfer.download absoluteUrl, zipFile, (zipEntry) =>>
      lib.makeSet id, (setEntry) =>>
        zip.unzip zipFile, setEntry.toURL(), (code) =>>
          zipEntry.remove =>>
            if code is 0
              callback()
            else
              errback "Unzip operation on #{zipFile} returned #{code}"
    , errback

window.Remote = Remote
