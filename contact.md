---
layout: page
title: Contact
permalink: /contact/
body_class: page-contact
hide_title: true
---

<div class="contact-page-layout">
  <div class="contact-page-photo">
    <img src="{{ '/images/contact_photo.jpeg' | relative_url }}" alt="Todor Pophristic" loading="lazy" decoding="async" />
  </div>
  <div class="contact-page-text">
    <h1 class="contact-page-title">{{ page.title | escape }}</h1>
    <p>Based in LA</p>
    <p>609-681-7748</p>
    <p><a href="mailto:{{ site.author.email }}">{{ site.author.email }}</a></p>
  </div>
</div>
