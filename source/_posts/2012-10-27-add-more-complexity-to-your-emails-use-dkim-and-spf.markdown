---
layout: post
title: "Add more complexity to your Emails - use DKIM and SPF"
date: 2012-10-27 13:15
comments: false
categories: Administration
---

The next thing my paranoid me couldn't stand of is that my emails can be easily
spoofed. Yeah, I know I'm not a very famous person, so probability of such
thing happening is similar to zero, but hey - tell this to my Paranoid me. :)
I also sign every mail I could (they can be easily verified using
[my public key](/public-key.txt)), but still - DKIM seems to be a fine
solution. And besides, I love to play with new things. So after many
experiments with [dkim-milter](http://sourceforge.net/projects/dkim-milter/),
[DKIMProxy](http://sourceforge.net/projects/dkimproxy/) and
[opendkim](http://www.opendkim.org/) I finally decided to use the last one.
Mostly because it's easiest to configure and is still maintained.

<!--more-->

## Installing and configuring opendkim

You will be suprised how simple it is. :) Firstly you need to install a proper
debian packages:

{% codeblock As root lang:sh %}
apt-get install opendkim libmail-dkim-perl
{% endcodeblock %}

The second one is a dkim support for spamassassin. I'll cover that later. Next,
you need to edit your `/etc/opendkim.conf` file:

{% codeblock /etc/opendkim.conf lang:sh %}
SysLog             yes
Umask              002

KeyTable           /etc/mail/dkim/KeyTable
SigningTable       /etc/mail/dkim/SigningTable
ExternalIgnoreList /etc/mail/dkim/TrustedHosts
InternalHosts      /etc/mail/dkim/TrustedHosts

Canonicalization   relaxed/simple
Mode               sv
X-Header           yes
{% endcodeblock %}

`Mode sv` directive tells opendkim to sign but also verify messages, while
`X-Header` adds `X-Dkim` header (which contains information about the DKIM
daemon you are using). Next we need to tell opendkim which port it will be
using, so in `/etc/default/opendkim` uncomment:

{% codeblock /etc/default/opendkim lang:sh %}
SOCKET="inet:12345@localhost" # listen on loopback on port 12345
{% endcodeblock %}

Now we have to populate those extra files we defined. `TrustedHosts` is the
easiest one, it's just the list of hosts and domains which are allowed to use
DKIM. So in most cases:

{% codeblock /etc/mail/dkim/TrustedHosts lang:sh %}
localhost
127.0.0.1
192.168.1.1
1.2.3.4 # external IP
{% endcodeblock %}

Next, we need to create a key and DNS TXT record pair for each domain we want
to be signed. I suggest to use strong key (`-b` parameter), to avoid
[some company's failure](http://www.wired.com/threatlevel/2012/10/dkim-vulnerability-widespread).
To do this:

{% codeblock As root lang:sh %}
mkdir -p /etc/mail/dkim/keys/mydomain.com
cd /etc/mail/dkim/keys/mydomain.com
opendkim-genkey -r -b 2048 -d mydomain.com -s mail
chown opendkim:opendkim mail.private
chmod 600 mail.private
{% endcodeblock %}

This will create two files: `mail.private` - which contains a private RSA key,
and `mail.txt` which contains a contents for DNS TXT record. So let's make use
of them! First keys - they need to be fined in `KeyTable` and `SingingTable`
files.

{% codeblock /etc/mail/dkim/KeyTable lang:sh %}
mail._domainkey.mydomain.com mydomain.com:mail:/etc/mail/dkim/keys/mydomain.com/mail.private
{% endcodeblock %}

{% codeblock /etc/mail/dkim/SigningTable lang:sh %}
mydomain.com mail._domainkey.mydomain.com
{% endcodeblock %}

The last thing we need to do is to add a DNS TXT record for
`mail._domainkey.mydomain.com` domain containing contents provided by
`opendkim-genkey`. For example for irgon.com it looks like this:

{% codeblock DNS TXT record lang:sh %}
mail._domainkey.irgon.com descriptive text "v=DKIM1\; g=*\; k=rsa\; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsfIThdXoizR6sop0gifPwPkT45I/KnTTNKDS4BHWtoU6as62c/3BRQuKqDAIacheZzWbfEPq/M2YvoNrVhx1laltg7aeUhZlcVOtz415lIy8M8oUVTCDxewBKsTEQD5M4Roaadoj7vzpA1JMcOEv36TizFq/KB5GL46pVNyOMJ+Mg" "97F+EQQeiOFsn/T+tNuxWky3l4Qky3S8U34wYmRSr+sVLu4U31QtocwL4uJ7ofVNdVk0baYo7s1HYnM3CGEKK+zdHTR/AoNiquvVX1lLX9s85bade4cNuRaINjzDyM4fAglLgSHZEtRcRlYqdMEpQcplI1OaSxIFS4DpFL3RwIDAQAB"
{% endcodeblock %}

And that settles DKIM. All we have left is starting it:

{% codeblock As root lang:sh %}
/etc/init.d/opendkim start
{% endcodeblock %}

## Connecting opendkim to postfix

This is really simple part.

{% codeblock /etc/postfix/main.cf lang:sh %}
# DKIM
milter_default_action = accept
milter_protocol = 6
smtpd_milters = inet:localhost:12345
non_smtpd_milters = inet:localhost:12345
{% endcodeblock %}

then. reload it and you are set.

## Installing SPF

Ok, now THAT is simple. Just install package:

{% codeblock As root lang:sh %}
apt-get install postfix-policyd-spf-python
{% endcodeblock %}

and add service:

{% codeblock /etc/postfix/master.cf lang:sh %}
policy-spf  unix  -  n  n  -  -  spawn user=nobody argv=/usr/bin/policyd-spf
{% endcodeblock %}

Add spf timeout to `/etc/postfix/main.cf` and adjust
`smtpd_recipient_restrictions` to include
`check_policy_service unix:private/policy-spf`, so in my file it looks like
this:

{% codeblock /etc/postfix/main.cf lang:sh %}
[...]
smtpd_recipient_restrictions = reject_unauth_pipelining,
                               permit_sasl_authenticated,
                               permit_mynetworks,
                               reject_non_fqdn_recipient,
                               reject_unknown_recipient_domain,
                               reject_unauth_destination,
                               reject_unknown_sender_domain,
                               check_policy_service unix:private/policy-spf
[...]
spf-policyd_time_limit = 3600s
{% endcodeblock %}

Last but not least is updating a DNS record. This is simple and similar to DKIM -
just ad TXT record to your TLD containing `v=spf1 a mx ip4:<your ip>`, for
example my looks like this:

{% codeblock DNS TXT record lang:sh %}
irgon.com descriptive text "v=spf1 a mx ip4:213.134.188.213"
{% endcodeblock %}

Don't forget to restart your Postfix when you're done!

## Testing

To test if everything works fine, just send yourself an email and check it
headers. You should see something like:

{% codeblock Mail header lang:sh %}
X-Dkim: OpenDKIM Filter v2.0.1 myexample.com 0224020B8
Dkim-Signature: v=1; a=rsa-sha256; c=relaxed/simple; d=myexample.com; s=mail; t=1351357546; bh=Rskt6Q/nZKmxgXkWUYP6cCBSDJhtkVT0PSrUEVGVgp4=; h=From:Content-Type:Content-Transfer-Encoding:Subject:Message-Id: Date:To:Mime-Version; b=phPQdG6HYaders4Xv0TsK2mT+PFYVk/brOFpnmCjCZtvbeGJ+XwrNk4Tnc9xGELtAglLOVplSvMV9nTK6xonta1qLTtnLYPsY4o/WPfyZYDgHmp6X9ZYP4otAHYK3jC00PbKGNqhXeD3bCc7CBV/aVGMQX4Bt0TjAAgndeYCI9VnvR2zH0iTEjlAT2OXrh2JV+wrK5UOXae8gRPT28F2Mg325YOiDwD1T5bgFtfc9mh2s/NRcy7lyDiPcb3CNV+nMXKyq/47o22LlALv5g5+OBBZACQYpYtgalM54InQDPoL/udvKtI/YYaiByFLwqeYFh2LXX6et 9dAiNCRLL+EoA==
{% endcodeblock %}

Which means that singing is alive and kicking. To test verification, just send
yourself an email from DKIM-using provider (like Yahoo or Gmail) and check for
following header:

{% codeblock Mail header lang:sh %}
Authentication-Results: myexample.com; dkim=pass (2048-bit key; insecure key) header.i=@gmail.com; dkim-adsp=pass
{% endcodeblock %}

Which means, that verfication is working. As the last final test, send email to
`autorespond+dkim@dk.elandsys.comz. This is automated service, which checks
your DKIM headers for you and sends back the results. If you get DKIM Signature
validation: passz in the body, then it means, that everything is working
properly.

## Final polishing

By default spamassassin has DKIM filters enabled. To ensure, look for
`loadplugin Mail::SpamAssassin::Plugin::DKIM` in your
`/etc/spamassassin/v312.pre` file. When it's enabled you should see values like
`DKIM_VALID` or `T_DKIM_INVALID` in `X-Spam-Status` header. Normally,
spamassassin puts a very little weight to that rules, but you can easily
increase it by adding:

{% codeblock /etc/mail/spamassassin/local.cf lang:sh %}
score T_DKIM_INVALID 10
score DKIM_ADSP_CUSTOM_MED 10
{% endcodeblock %}

You can also add sieve filter based on `Authentication-Results` if you want to
treat those suspicious messages differently than normal spam:

{% codeblock .dovecot.sieve lang:sh %}
if header :contains "Authentication-Results" "dkim=fail" { fileinto "DANGER"; stop; }
{% endcodeblock %}

The possibilities are endless :)

### Sources

* [http://blog.tjitjing.com/index.php/2012/03/guide-to-install-opendkim-for-multiple-domains-with-postfix-and-debian.html](http://blog.tjitjing.com/index.php/2012/03/guide-to-install-opendkim-for-multiple-domains-with-postfix-and-debian.html)
* [http://syslog.tv/2011/09/17/postfix-dk-dkim-spf/](http://syslog.tv/2011/09/17/postfix-dk-dkim-spf/)
