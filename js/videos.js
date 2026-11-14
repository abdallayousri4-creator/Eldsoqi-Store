/* ==========================================================================
   Eldsoqi Store — Educational videos & projects
   Local MP4 playback inside a custom modal player (YouTube-ready structure)
   ========================================================================== */

(function (global) {
  "use strict";

  var D = global.Eldsoqi.Data;

  function icon(name, extra) {
    return '<svg class="icon ' + (extra || "") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }

  function renderVideos() {
    var grid = document.getElementById("videosGrid");
    var count = document.getElementById("videosCount");
    if (count) count.textContent = String(D.VIDEOS.length);
    if (!grid) return;

    grid.innerHTML = D.VIDEOS.map(function (video, index) {
      return (
        '<article class="video-card reveal reveal-delay-' + ((index % 3) + 1) + '">' +
          '<button type="button" class="video-thumb" data-video="' + video.id + '" aria-label="تشغيل فيديو: ' + D.escapeHtml(video.title) + '">' +
            '<img src="' + D.escapeHtml(video.poster) + '" alt="' + D.escapeHtml(video.title) + '" loading="lazy">' +
            '<span class="video-tag">' + D.escapeHtml(video.category) + "</span>" +
            '<span class="play-btn">' + icon("play", "icon-fill") + "</span>" +
            '<span class="video-duration">' + icon("clock") + D.escapeHtml(video.duration) + "</span>" +
          "</button>" +
          '<div class="video-body">' +
            "<h3>" + D.escapeHtml(video.title) + "</h3>" +
            '<p class="video-sub" dir="ltr">' + D.escapeHtml(video.subtitle) + "</p>" +
            "<p>" + D.escapeHtml(video.desc) + "</p>" +
            '<div class="video-actions">' +
              '<button type="button" class="btn btn-primary btn-sm" data-video="' + video.id + '">' +
                icon("play", "icon-fill") + "مشاهدة الفيديو" +
              "</button>" +
              '<span class="video-provider">' + icon("clock") + "المدة " + D.escapeHtml(video.duration) + "</span>" +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  function renderProjects() {
    var grid = document.getElementById("projectsGrid");
    var count = document.getElementById("projectsCount");
    if (count) count.textContent = String(D.PROJECTS.length);
    if (!grid) return;

    grid.innerHTML = D.PROJECTS.map(function (project, index) {
      return (
        '<article class="project-card reveal reveal-delay-' + ((index % 3) + 1) + '">' +
          '<button type="button" class="project-media" data-project="' + project.id + '" aria-label="عرض مشروع: ' + D.escapeHtml(project.title) + '">' +
            '<img src="' + D.escapeHtml(project.cover) + '" alt="' + D.escapeHtml(project.title) + '" loading="lazy">' +
            '<span class="project-cat">' + D.escapeHtml(project.category) + "</span>" +
            '<span class="project-play">' + icon("play", "icon-fill") + "</span>" +
            '<span class="project-duration">' + D.escapeHtml(project.duration) + "</span>" +
          "</button>" +
          '<div class="project-body">' +
            "<h3>" + D.escapeHtml(project.title) + "</h3>" +
            "<p>" + D.escapeHtml(project.desc) + "</p>" +
            '<button type="button" class="btn btn-outline btn-sm" data-project="' + project.id + '">' +
              icon("play", "icon-fill") + "عرض المشروع" +
            "</button>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  /* ------------------------------- playback ------------------------------ */
  function playerHtml(item, isProject) {
    if (item.youtubeId) {
      return (
        '<div class="video-modal-inner">' +
          '<div class="video-modal-frame">' +
            '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(item.youtubeId) + '?autoplay=1&rel=0" title="' + D.escapeHtml(item.title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
          "</div>" +
          metaHtml(item, isProject) +
        "</div>"
      );
    }
    return (
      '<div class="video-modal-inner">' +
        '<video class="video-modal-player" controls autoplay playsinline preload="metadata" poster="' + D.escapeHtml(item.poster || item.cover) + '">' +
          '<source src="' + D.escapeHtml(item.video || item.src) + '" type="video/mp4">' +
          "متصفحك لا يدعم تشغيل الفيديو." +
        "</video>" +
        metaHtml(item, isProject) +
      "</div>"
    );
  }

  function metaHtml(item, isProject) {
    return (
      '<div class="video-modal-meta">' +
        '<span class="video-tag-static">' + D.escapeHtml(isProject ? item.category : item.category) + "</span>" +
        "<h3 id=\"videoModalTitle\">" + D.escapeHtml(item.title) + "</h3>" +
        "<p>" + D.escapeHtml(isProject ? item.desc : item.desc + " — المدة " + item.duration) + "</p>" +
      "</div>"
    );
  }

  function fillModal(html) {
    var body = document.getElementById("videoModalBody");
    if (!body) return;
    body.innerHTML = html;
    if (global.Eldsoqi.UI) {
      global.Eldsoqi.UI.openModal("videoModal");
      var player = body.querySelector("video");
      if (player) {
        var promise = player.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () { /* التشغيل التلقائي قد يُمنع — المستخدم يستطيع الضغط على التشغيل */ });
        }
      }
    }
  }

  function openVideo(id) {
    var video = D.VIDEOS.find(function (item) { return item.id === id; });
    if (!video) return;
    fillModal(playerHtml(video, false));
  }

  function openProject(id) {
    var project = D.PROJECTS.find(function (item) { return item.id === id; });
    if (!project) return;

    var galleryThumbs = "";
    if (project.gallery && project.gallery.length > 1) {
      galleryThumbs = '<div class="qv-thumbs" style="padding:10px 16px;background:#0B1B33;">' +
        project.gallery.map(function (src, index) {
          return '<button type="button" class="qv-thumb' + (index === 0 ? " is-active" : "") + '" data-project-thumb="' + D.escapeHtml(src) + '" aria-label="صورة المشروع ' + (index + 1) + '">' +
            '<img src="' + D.escapeHtml(src) + '" alt="' + D.escapeHtml(project.title) + '" loading="lazy">' +
          "</button>";
        }).join("") + "</div>";
    }

    fillModal(playerHtml(project, true) + galleryThumbs);
  }

  function stop() {
    var body = document.getElementById("videoModalBody");
    if (!body) return;
    body.querySelectorAll("video").forEach(function (video) {
      try {
        video.pause();
        video.removeAttribute("src");
        video.querySelectorAll("source").forEach(function (source) { source.removeAttribute("src"); });
        video.load();
      } catch (error) { /* تجاهل */ }
    });
    body.innerHTML = "";
  }

  function bind() {
    document.addEventListener("click", function (event) {
      var videoTrigger = event.target.closest("[data-video]");
      if (videoTrigger) {
        openVideo(videoTrigger.getAttribute("data-video"));
        return;
      }
      var projectTrigger = event.target.closest("[data-project]");
      if (projectTrigger) {
        openProject(projectTrigger.getAttribute("data-project"));
        return;
      }
      var thumb = event.target.closest("[data-project-thumb]");
      if (thumb) {
        var modalBody = document.getElementById("videoModalBody");
        var main = modalBody ? modalBody.querySelector("video") : null;
        if (main) main.setAttribute("poster", thumb.getAttribute("data-project-thumb"));
        var thumbs = document.querySelectorAll("[data-project-thumb]");
        thumbs.forEach(function (item) { item.classList.remove("is-active"); });
        thumb.classList.add("is-active");
      }
    });
  }

  function init() {
    renderVideos();
    renderProjects();
    bind();
    if (global.Eldsoqi.UI) {
      global.Eldsoqi.UI.bindImageFallbacks(document.getElementById("videosGrid"));
      global.Eldsoqi.UI.bindImageFallbacks(document.getElementById("projectsGrid"));
    }
  }

  global.Eldsoqi.Videos = {
    init: init,
    openVideo: openVideo,
    openProject: openProject,
    stop: stop
  };
})(window);
