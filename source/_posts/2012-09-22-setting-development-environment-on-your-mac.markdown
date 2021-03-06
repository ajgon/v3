---
layout: post
title: "Setting development environment on your Mac"
date: 2012-09-22 12:33
comments: false
categories: PHP
---

Recently I bought an
[awesome piece of hardware](http://www.anandtech.com/show/4253/the-crucial-m4-micron-c400-ssd-review)
to my MacBook Pro. Unfortunatelly
[to install it](http://www.ifixit.com/Guide/Installing-MacBook-Pro-13-Inch-Unibody-Early-2011-Hard-Drive-Replacement/5119/1),
I had to remove my old HDD and all system files with it as well. So for that
occasion I made myself double gift (Christmas are earlier this year ;)) and
also bought a [new OS](http://www.apple.com/osx/). After smooth installation,
[some tweaks](http://blog.alutam.com/2012/04/01/optimizing-macos-x-lion-for-ssd/)
and [huge performance boost](http://mobilityupdate.com/mac/crucal-m4-macbook-pro-2011/)
I started setting my developer environment once again - nice and clean.

<!--more-->

## Installing developer "must-have" applications

Firstly, two most important things are a terminal emulator - in my case, it is
[iTerm2](http://www.iterm2.com/#/section/home), and
[XCode](https://developer.apple.com/technologies/tools/) with
[command line tools](http://stackoverflow.com/questions/9329243/xcode-4-4-command-line-tools).
Next thing is of course package manager. After alot of nasty fighting and bad
experiences with [macports](http://www.macports.org/) I switched to
[Homebrew](http://mxcl.github.com/homebrew/) and I love it. To install it,
simply type:

{% codeblock As user lang:sh %}
ruby <(curl -fsSkL raw.github.com/mxcl/homebrew/go)
{% endcodeblock %}

After installing it, i suggest to type `brew doctor` and follow the
instructions if something unexpected occurs. However, in clean
Mountain Lion+XCode+command line tools installation I didn't get any warnings,
so you shouldn't as well.

Next important thing is [git](http://git-scm.com/). Even if you don't plan to
use it (but I strongly recommend this tool), install it, because a lot of
software depends on it these days. Especially if you are a Ruby developer.
So just type:

{% codeblock As user lang:sh %}
brew install git
{% endcodeblock %}

and you're set. Another thing, which I really like is
[Z Shell](http://www.zsh.org/) with it's excellent extension
[oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh). Words can't describe
how awesome it is, so watch
[this video](https://www.youtube.com/watch?v=m07MiM6rmMc), and then type:

{% codeblock As user lang:sh %}
curl -L https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh | sh
{% endcodeblock %}

## Installing dnsmasq and nginx

The next step is installing [nginx](http://nginx.org/), which is a great
alternative to [apache](http://www.apache.org/).

{% codeblock As user lang:sh %}
brew install nginx
sudo ln -s /usr/local/etc/nginx /etc/nginx
{% endcodeblock %}

As for configuration, take look at my
[DeeDee project nginx configuration files](https://github.com/ajgon/DeeDee/tree/master/etc/nginx)
- they are really good starting point for configuring your nginx. However, if
you are lazy, just take and copy `wordpress` and `php` files from `extra/lang`
directory (on DeeDee github) to `/usr/local/etc/nginx` (this is where your
nginx configuration files lives) and add following section at the bottom
(before the last closing bracket) of the `nginx.conf` file:

{% codeblock /usr/local/etc/nginx/nginx.conf lang:sh %}
server {
    server_name ~^(www.)?(?<project>[^.]+).php.dev;
    # This is the path, where your projects lives.
    # $project is domain part but as well directory.
    # So something.php.dev will take files from /Users/yourname/Projects/something/public
    root /Users/yourname/Projects/$project/public;
    error_log logs/php.dev.error_log info;
    index index.html index.php;
    include php;
}

server {
    server_name ~^(www.)?(?<project>[^.]+).wp.dev;
    # This is the path, where your projects lives.
    # $project is domain part but as well directory.
    # So something.wp.dev will take files from /Users/yourname/Projects/something/public
    root /Users/yourname/Projects/$project/public;
    error_log logs/wp.dev.error_log info;
    index index.html index.php;
    include php;
    include wordpress;
}
{% endcodeblock %}

Now type `sudo /usr/local/sbin/nginx -t` - if eveyrhing is okay, you should see
a proper message.

Next thing we need to do is to make those wp.dev and php.dev domains work. To
do this, install [dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html):

{% codeblock As user lang:sh %}
brew install dnsmasq
cp $(brew --prefix dnsmasq)/dnsmasq.conf.example /usr/local/etc/dnsmasq.conf
sudo cp $(brew --prefix dnsmasq)/homebrew.mxcl.dnsmasq.plist /Library/LaunchDaemons
{% endcodeblock %}

Now edit newly created `dnsmasq.conf` file and add:
{% codeblock /usr/local/etc/dnsmasq.conf lang:sh %}
address=/.dev/127.0.0.1
{% endcodeblock %}

Last thing left, is setting a nameserver to 127.0.0.1 in your Network prefpane,
as shown below.

![dnsmasq configuration](/images/upload/dnsmasq.png)

From now on all *.dev domains will be translated to `127.0.0.1` and from there
all `wp.dev` and `php.dev` domains will be handled by nginx. Good stuff.

## Installing PHP-FPM and MySQL

Unlike apache, nginx doesn't have a native PHP module, so we have to help
ourselves with FastCGI extension. Thankfully there is a great wrapper for
PHPcgi called PHP-FPM. Not only it sets all the hard work for us, but it also
watches PHP for unexpected crashes (well.. yeah, it's PHP after all) and
restarts it immediately - so it saves our time. Unfortunately, brew doesn't
contain PHP recipes out of box, so we need
[a little help](https://github.com/josegonzalez/homebrew-php). To install PHP:

{% codeblock As user lang:sh %}
brew tap homebrew/dupes
brew tap josegonzalez/homebrew-php
brew install php54 --with-mysql --with-fpm --with-intl # you can add --with-pgsql if you are using it
{% endcodeblock %}

Installing MySQL is a little bit complicated:

{% codeblock As user lang:sh %}
brew install mysql
unset TMPDIR
mysql_install_db --verbose --user=`whoami` --basedir="$(brew --prefix mysql)" --datadir=/usr/local/var/mysql --tmpdir=/tmp
mysql.server start
/usr/local/opt/mysql/bin/mysqladmin -u root password ''
/usr/local/opt/mysql/bin/mysqladmin -u root -h localhost password ''
{% endcodeblock %}

## Putting everything together

As you may noticed, all this stuff won't start automatically. I think it's a
good approach, because when I use my mac for normal stuff, I don't want any
unnecessary resources consumed. So to tie all of this together, I have a simple
script which will launch or disable all the services on demand. Just create
(and make executable) `/usr/local/bin/dev<` file with following contents:

{% codeblock /usr/local/bin/dev lang:sh %}
#!/bin/bash
if [$# -lt 1 ]; then
    echo "Usage: $0 on|off"
else
    if [ $1 = 'on' ]; then
        $(brew --prefix php54)/sbin/php-fpm --fpm-config /usr/local/etc/php/5.4/php-fpm.conf 2> /dev/null &
        sudo /usr/local/sbin/nginx
        mysql.server start > /dev/null
    else
        killall php-fpm 2> /dev/null
        sudo killall nginx 2> /dev/null
        mysql.server stop 2> /dev/null
    fi
fi
{% endcodeblock %}

Now when you need to enter "development mode" simply type `dev on` and to quit
`dev off`.

## Conclusion

Well, that's all! I hope you will enjoy this simple environment as much as
I do :).
