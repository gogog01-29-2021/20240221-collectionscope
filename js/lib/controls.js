'use strict';

var Controls = (function() {

  function Controls(config) {
    var defaults = {
      "el": "#app",
      "maxVelocity": 20,
      "acceleration": 0.2,
      "bounds": [-16384, 16384]
    };
    this.opt = _.extend({}, defaults, config);
    this.init();
  }

  function isTouchDevice() {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  }

  Controls.prototype.init = function(){
    this.$el = $(this.opt.el);
    this.isTouch = isTouchDevice();
    this.moveDirection = 0;
    this.velocity = 0;
    this.camera = this.opt.camera;
    this.loaded = false;
  };

  Controls.prototype.load = function(){
    this.loadMenus();
    this.loadListeners();
    this.loaded = true;
    this.update();
  };

  Controls.prototype.loadListeners = function(){
    var _this = this;
    var isTouch = this.isTouch;

    $('input[type="radio"]').on('change', function(e) {
      _this.onRadioMenuChange($(this));
    });

    $('.move-button').each(function(){
      var el = $(this)[0];
      var direction = parseInt($(this).attr('data-direction'));

      var mc = new Hammer(el);
      mc.on("press", function(e) {
        _this.moveDirection = direction;
      });

      mc.on("pressup", function(e){
        _this.moveDirection = 0;
      });
    });

    $(document).keydown(function(e) {
      switch(e.which) {
        case 38: // arrow up
        case 87: // w
          _this.moveDirection = 1;
          break;

        case 40: // arrow down
        case 83: // s
          _this.moveDirection = -1;
          break;

        case 37: // arrow left
        case 65: // a
          break;

        case 39: // arrow right
        case 68: // d
          break;

        default:
          break;
      }
    });

    $(document).keyup(function(e) {
      switch(e.which) {
        case 38: // arrow up
        case 87: // w
        case 40: // arrow down
        case 83: // s
          _this.moveDirection = 0;
          break;

        default:
          break;
      }
    });

    $(document).on('mousedown', 'canvas', function(e) {
      if (isTouch) return;
      switch (e.which) {
        // left mouse
        case 1:
          _this.moveDirection = 1;
          break;
        // right mouse
        case 3:
          e.preventDefault();
          _this.moveDirection = -1;
          break;
        default:
          break;
      }
    });

    $(document).on('contextmenu', 'canvas', function(e) {
      e.preventDefault();
    });

    $(document).on('mouseup', 'canvas', function(e) {
      if (isTouch) return;
      _this.moveDirection = 0;
    });
  };

  Controls.prototype.loadMenus = function(){
    var _this = this;

    _.each(this.opt.menus, function(menu){
      if (_.has(menu, 'radioItems')) _this.loadRadioMenu(menu);
      else if (_.has(menu, 'slider')) _this.loadSliderMenu(menu);
    });
  };

  Controls.prototype.loadRadioMenu = function(options){
    var html = '';
    html += '<div id="'+options.id+'" class="'+options.className+' menu">';
      if (options.label) {
        html += '<h2>'+options.label+'</h2>';
      }
      html += '<form class="radio-button-form">';
      _.each(options.radioItems, function(item, i){
        var id = item.name + (i+1);
        var checked = item.checked ? 'checked' : '';
        html += '<label for="'+id+'"><input id="'+id+'" type="radio" name="'+item.name+'" value="'+item.value+'" '+checked+' /> '+item.label+'</label>';
      });
      html += '</form>';
    html += '</div>';
    var $menu = $(html);
    this.$el.append($menu);
  };

  Controls.prototype.loadSliderMenu = function(options){

  };

  Controls.prototype.onRadioMenuChange = function($input){
    var name = $input.attr('name');
    var value = [$input.val()];

    if (name.indexOf('filter-') === 0) {
      var parts = name.split('-', 2);
      name = 'filter-property';
      value.unshift(parts[1]);
    } else {
      name = 'change-'+name;
    }
    // console.log('Triggering event "change-'+name+'" with value "'+value+'"');
    $(document).trigger(name, value);
  };

  Controls.prototype.update = function(now){
    if (!this.loaded) return;

    var moveDirection = this.moveDirection;
    var acceleration = false;

    // accelerate
    if (moveDirection !== 0 && Math.abs(this.velocity) < this.opt.maxVelocity) {
      acceleration = this.opt.acceleration * moveDirection;
      this.velocity += acceleration;

    // deccelerate
    } else if (moveDirection === 0 && Math.abs(this.velocity) > 0) {
      var currentDirection = this.velocity / Math.abs(this.velocity);
      moveDirection = -currentDirection; // move in the opposite direction of the current velocity
      acceleration = this.opt.acceleration * moveDirection;
      this.velocity += acceleration;

      if (currentDirection > 0) this.velocity = Math.max(this.velocity, 0);
      else this.velocity = Math.min(this.velocity, 0);
    }

    // move camera if velocity is non-zero
    if (this.velocity > 0 || this.velocity < 0) {
      var newZ = this.camera.position.z + this.velocity;
      newZ = MathUtil.clamp(newZ, this.opt.bounds[0], this.opt.bounds[1]);
      this.camera.position.setZ(newZ);
      renderNeeded = true;
    }
  };

  return Controls;

})();
