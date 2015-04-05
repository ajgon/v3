/* function found on internet, signed by 'weston' */
function getMouseCoordsWithinEventTarget(event)
{
    var coords = { x: 0, y: 0};

    if(!event) // then we have a non-DOM (probably IE) browser
    {
        event = window.event;
        coords.x = event.offsetX;
        coords.y = event.offsetY;
    }
    else       // we assume DOM modeled javascript
    {
        var Element = event.target ;
        var CalculatedTotalOffsetLeft = 0;
        var CalculatedTotalOffsetTop = 0 ;

        while (Element.offsetParent)
        {
            CalculatedTotalOffsetLeft += Element.offsetLeft + (navigator.appName == 'Opera' ? Element.parentNode.offsetLeft : 0); // Opera hack
            CalculatedTotalOffsetTop += Element.offsetTop + (navigator.appName == 'Opera' ? Element.parentNode.offsetTop : 0); // Opera hack
            Element = Element.offsetParent ;
        }

        coords.x = event.pageX - CalculatedTotalOffsetLeft ;
        coords.y = event.pageY - CalculatedTotalOffsetTop ;
    }
    return coords;
}

var SliderShow = {
    initialize: function() {
        this.result = '';
        new Element('span').setProperty('id', 'sliderLeft').injectBefore($('slider'));
        new Element('span').setProperty('id', 'sliderRight').injectAfter($('slider'));
        $('branding').setStyle('padding-bottom', '10px');
        $('slider').setStyles({'height': '150px', 'overflow': 'hidden'});
        $A($('slides').getElementsByTagName('li')).each(function(myli) {
            $(myli.firstChild.firstChild).setOpacity(1);
            $(myli).firstChild.setAttribute('href', 'javascript: void(0)');
            new Element('span').setOpacity(navigator.appName == 'Konqueror' ? 0 : 0.7).setStyles({
                'display': 'block',
                'position': 'absolute',
                'left': '0px',
                'top': '0px',
                'width': '150px',
                'height': '150px',
                'background-color': '#000000',
                'cursor': 'pointer' }).injectBefore(myli.firstChild);
            myli.addEvent('click', function() { this.receiveDetail(myli.id) }.bind(this));
        }.bind(this));

        $('sliderLeft').onmouseover = function(event) {
            this.moveSlider.moveRight();
        }.bind(this);
        $('sliderLeft').onmouseout = function(event) {
            this.moveSlider.stop();
        }.bind(this);
        $('sliderRight').onmouseover = function(event) {
            this.moveSlider.moveLeft();
        }.bind(this);
        $('sliderRight').onmouseout = function(event) {
            this.moveSlider.stop();
        }.bind(this);

        var spans = $A($('slides').getElementsByTagName('span'));
        spans.each(function(myspan) {
            var myeffect = new Fx.Style(myspan, 'opacity', {duration: 500, wait: false});
            myspan.addEvent('mouseover', function() {
                myeffect.start(myspan.getStyle('opacity'), 0);
            }).addEvent('mouseout', function() {
                myeffect.start(myspan.getStyle('opacity'), 0.7);
            });
        });
        this.moveSlider.timer = null;
    },
    moveSlider: {
        speed: 10,
        move1pxLeft: function() {
            if(parseInt($('slides').getStyle('left')) >= -(parseInt($('slides').getStyle('width')) - parseInt($('slider').getStyle('width')) - this.speed))
            {
                $('slides').setStyle('left', (parseInt($('slides').getStyle('left')) - this.speed) + 'px');
            }
            else
            {
                this.stop();
            }
        },
        move1pxRight: function() {
            if( parseInt($('slides').getStyle('left')) <= -this.speed )
            {
                $('slides').setStyle('left', (parseInt($('slides').getStyle('left')) + this.speed) + 'px');
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
    },
    receiveDetail: function(name)
    {
        new Element('div').setProperty('id', 'mask').setOpacity(0.6).injectAfter($('wrapper'));
        if(navigator.appName == 'Konqueror')
        {
            $('mask').setStyles({'background-color': 'transparent', 'background-image': 'url(/images/konqueror-mask.png)', 'background-repeat': 'repeat'});
        }
        new Element('div').setProperty('id', 'indicator').injectAfter($('mask'));
        new Ajax('ajax/' + name + '.js', {
            method: 'get',
            onComplete: function(response) {
                this.showDetail(response);
            }.bind(this)}).request();
    },
    showDetail: function(strResponse)
    {
        var detail = new Element('div').setProperty('id', 'detail');
        detail.injectAfter($('mask'));
        eval(strResponse);
        $('close').addEvent('click', function() {
            document.body.removeChild($('mask'));
            if(isIe)
            {
                document.body.removeChild($('detail-ie6'));
            }
            else
            {
                document.body.removeChild($('detail'));
            }
        }.bind(this));
        $('thumb').onmousemove = this.showZoom;
        if(isIe)
        {
            $('detail').removeChild($('detail').firstChild);
            $('detail').removeChild($('detail').lastChild);
            new Element('div').setProperty('id', 'detail-ie6').injectBefore('detail');
            detailold = $('detail');
            $('detail').parentNode.removeChild($('detail'));
            detailold.injectInside($('detail-ie6'));
            new Element('span').setProperty('class', 'top').injectBefore($('detail'));
            new Element('span').setProperty('class', 'bottom').injectAfter($('detail'));
            $('detail-ie6').setStyle('margin-top', -(Math.round($('detail-ie6').offsetHeight / 2) + 12) + 'px');
        }
        else
        {
            detail.setStyle('margin-top', -(Math.round(detail.offsetHeight / 2) + 12) + 'px');
        }
        document.body.removeChild($('indicator'));
    },
    showZoom: function(event)
    {
        var coords = (getMouseCoordsWithinEventTarget(event));
        var bpW = $('bigpreview').offsetWidth;
        var bpH = $('bigpreview').offsetHeight;
        var posX = Math.round( 99 - (bpW * coords.x / 368) );
        var posY = Math.round( 70 - (bpH * coords.y / 292) );
        posX = posX < -bpW + 198 ? -bpW + 198 : (posX > 0 ? 0 : posX);
        posY = posY < -bpH + 140 ? -bpH + 140 : (posY > 0 ? 0 : posY);
        //$('debug').innerHTML = $('thumb').offsetLeft + $('thumb').parentNode.offsetLeft + ' - ' + ($('thumb').offsetTop + $('thumb').parentNode.offsetTop);
        $('bigpreview').setStyle('left', posX + 'px' );
        $('bigpreview').setStyle('top', posY  + 'px' );
    }

}

window.onDomReady(function(event) {
//window.onload = function(event) {
    isIe = navigator.appVersion.indexOf('MSIE 6.0') != '-1';
    SliderShow.initialize();
});
