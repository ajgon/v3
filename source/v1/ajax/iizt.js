  new Element('span').setProperty('class', 'top').injectInside($('detail'));
  new Element('span').setProperty('id', 'close').appendText('Close').injectInside($('detail'));
  new Element('h2').appendText('IIZT - Internet Is Zero Tolerance').injectInside($('detail'));
  rightColumn = new Element('div').setProperty('class', 'right-column').injectInside($('detail'));
    new Element('div').setProperties({'id': 'icon', 'class': 'preview'}).injectInside(rightColumn);
      new Element('img').setProperties({'alt': 'Logo of project iizt', 'src': 'images/portfolio/iizt_logo.png'}).injectInside($('icon'));
    new Element('div').setProperties({'id': 'preview', 'class': 'preview'}).injectInside(rightColumn);
      new Element('img').setProperties({'id': 'bigpreview', 'alt': 'Slice of project iizt', 'src': 'images/portfolio/iizt.png'}).injectInside($('preview'));
  new Element('img').setProperties({'id': 'thumb', 'alt': 'Sample page of project iizt', 'src': 'images/portfolio/iizt_view.png'}).injectInside($('detail'));
  info = new Element('div').setProperty('class', 'info').injectInside($('detail'));
    left = new Element('div').setProperty('class', 'left').injectInside(info);
      new Element('h3').appendText('Where?').injectInside(left);
      p = new Element('p').injectInside(left);
        new Element('a').setProperties({'href': 'http://www.iizt.com/', 'target': '_blank'}).appendText('http://www.iizt.com/').injectInside(p);
      new Element('h3').appendText('When?').injectInside(left);
      new Element('p').appendText('Jan 09, 2009'). injectInside(left);
      new Element('h3').appendText('What?').injectInside(left);
      new Element('p').appendText('XHTML1.1, CSS2.1, JS1.5, PHP5'). injectInside(left);
    right = new Element('div').setProperty('class', 'right').injectInside(info);
      new Element('h3').appendText('Description?').injectInside(right);
      new Element('p').appendText('IIZT [say "east"] is an independent and international agency for digital consultancy, design and creative &amp; technical production.'). injectInside(right);
  new Element('span').setProperty('class', 'bottom').injectInside($('detail'));
