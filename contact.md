---
layout: page
title: Contact
permalink: /contact/
body_class: page-contact
hide_title: true
---

<div class="contact-page-layout">
  <div class="contact-page-photo">
    {% include responsive-portrait-photo.html stem="contact_photo" alt="Todor Pophristic" %}
  </div>
  <div class="contact-page-text">
    <h1 class="contact-page-title">{{ page.title | escape }}</h1>
    <p>L.A. based writer and director</p>
    <p>609-681-7748</p>
    <p><a href="mailto:{{ site.author.email }}">{{ site.author.email }}</a></p>
  </div>
</div>
