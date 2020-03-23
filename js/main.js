'use strict';

var MainApp = (function() {

  function MainApp(config) {
    var defaults = {
      "el": "#app"
    };
    var globalConfig = typeof CONFIG !== 'undefined' ? CONFIG : {};
    this.opt = _.extend({}, defaults, config, globalConfig);
    this.init();
  }

  MainApp.prototype.init = function(){
    var _this = this;

    this.loadScene();

    this.collection = new Collection(_.extend({}, this.opt, {
      'onLoadEnd': function(){ _this.onLoadEnd(); },
      'onLoadProgress': function(){ _this.onLoadProgress(); }
    }));

    this.onLoadStart();
    this.collection.load();
  };

  MainApp.prototype.loadScene = function(){
    var $el = $(this.opt.el);
    var w = $el.width();
    var h = $el.height();
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, w / h, 1, 100000 );
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    $el.append(renderer.domElement);
    camera.position.z = 400;

    this.$el = $el;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
  };

  MainApp.prototype.onLoadEnd = function(){
    console.log("Loaded everything.");
    this.$el.removeClass('is-loading');

    this.render();
  };

  MainApp.prototype.onLoadProgress = function(){
    this.totalLoaded += 1;
    var percentFinished = this.totalLoaded / this.totalToLoad;
    percentFinished = Math.round(percentFinished * 100) + '%';
    this.$loadingText.text(percentFinished);
    this.$loadingProgress.css('width', percentFinished);
  };

  MainApp.prototype.onLoadStart = function(){
    this.totalLoaded = 0;
    this.totalToLoad = this.collection.getTotalToLoad();
    this.$loadingProgress = $('.loading-progress');
    this.$loadingText = $('.loading-text');
    this.$el.addClass('is-loading');
  };

  MainApp.prototype.render = function(){
    var _this = this;

    this.renderer.render( this.scene, this.camera );
    this.collection && this.collection.render();

    requestAnimationFrame(function(){
      _this.render();
    });

  };

  return MainApp;

})();
