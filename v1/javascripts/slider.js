var SliderShow = {
    initialize: function() {
        this.speed = 3;
        console.log(-(parseInt(Element.getStyle($('slides'), 'width')) - parseInt(Element.getStyle($('slider'), 'width')) - this.speed));
        $A($('slides').getElementsByTagName('li')).each(function(element) {
            Event.observe(element, 'mouseover', SliderShow.fadeIn.bindAsEventListener(this));
            Event.observe(element, 'mouseout', SliderShow.fadeOut.bindAsEventListener(this));
        });
        //Event.observe(document, 'mouseover', function() {SliderShow.cleanFades();});
        Event.observe($('slider'), 'mouseout', function() { this.stop(); }.bind(this));
        Event.observe($('sliderLeft'), 'mouseover', function() {
            this.cleanFades();
            this.moveRight();
        }.bind(this));
        Event.observe($('sliderRight'), 'mouseover', function() {
            this.cleanFades();
            this.moveLeft();
        }.bind(this));
        this.timer = null;
    },
    fadeIn: function(event) {
        mask = Event.findElement(event, 'li').firstChild;
        SliderShow.cleanFades();
        Effect.Fade(mask, {duration: 0.3, afterFinish: function() {
            if(Element.getStyle(mask, 'display') == 'none')
            {
                Element.setStyle(mask, {display: 'block', opacity: '0.0001'});
            }
        }});
        Event.stop(event);
    },
    fadeOut: function(event) {
        mask = Event.findElement(event, 'li').firstChild;
        SliderShow.cleanFades();
        Effect.Appear(mask, {duration: 0.3, to: '0.7', afterFinish: function() {
            Element.setStyle(mask, {display: 'block'});
            Element.setOpacity(mask, '0.7');
            console.log('gg');
        }});
        if(Element.getStyle(mask, 'display') == 'none')
        {
            Element.setStyle(mask, {display: 'block'});
            Element.setOpacity(mask, '0.7');
        }
        Event.stop(event);
    },
    cleanFades: function() {
        $A($('slides').getElementsByTagName('li')).each(function(element) {
            if(Element.getStyle(element.firstChild, 'display') == 'none')
            {
                Element.setStyle(element.firstChild, {display: 'block'});
                Element.setOpacity(element.firstChild, '0.7');
            }
        });
    },
    move1pxLeft: function() {
        if(parseInt(Element.getStyle($('slides'), 'left')) >= -(parseInt(Element.getStyle($('slides'), 'width')) - parseInt(Element.getStyle($('slider'), 'width')) - this.speed))
        {
            Element.setStyle($('slides'), {left: (parseInt(Element.getStyle($('slides'), 'left')) - this.speed) + 'px'});
        }
        else
        {
            this.stop();
        }
    },
    move1pxRight: function() {
        if( parseInt(Element.getStyle($('slides'), 'left')) <= -this.speed )
        {
            Element.setStyle($('slides'), {left: (parseInt(Element.getStyle($('slides'), 'left')) + this.speed) + 'px'});
        }
        else
        {
            this.stop();
        }
    },
    moveLeft: function() {
        this.stop();
        this.timer = setInterval(this.move1pxLeft.bind(this), 1);
    },
    moveRight: function() {
        this.stop();
        this.timer = setInterval(this.move1pxRight.bind(this), 1);
    },
    stop: function()
    {
        if(this.timer != null)
        {
            clearInterval(this.timer);
        }
    }

}

//Event.onDOMReady(function(event) {
Event.observe(window, 'load', function(event) {
    SliderShow.initialize();
});