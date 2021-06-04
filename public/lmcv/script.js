"use strict";

const fetchJSON = url => fetch(url)
  .then(response => response.json())
const corsProxy = url => `//cors-anywhere.herokuapp.com/${url}`
const types = ['snapshot', 'release']

window.addEventListener('DOMContentLoaded', () => {
  fetchJSON('https://launchermeta.mojang.com/mc/game/version_manifest.json')
    .then(data => {
      return Promise.all([
        fetchJSON(data.versions.find(x => x.id === data.latest.snapshot).url),
        fetchJSON(data.versions.find(x => x.id === data.latest.release).url)
      ])
    })
    .then(results => {
      results.forEach((data, key) => {
        const id = data.id
        const serverUrl = data.downloads.server.url
        const versionTime = moment(data.releaseTime).fromNow()

        const versionLink = document.querySelector(`a.${types[key]}.version`)
        versionLink.textContent = id
        versionLink.setAttribute('href', serverUrl)
        versionLink.setAttribute('download', `${id}_server.jar`)

        if (typeof localStorage !== 'undefined') {
          if (localStorage.getItem(types[key]) != id) versionLink.classList.add('new')
        }

        document.querySelector(`.${types[key]}.time`).textContent = ' - ' + versionTime

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(types[key], id)
        }
      })
  })
})
