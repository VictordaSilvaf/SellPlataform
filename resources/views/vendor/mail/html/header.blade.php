@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
<img src="{{ url('/logo.png') }}" width="56" height="56" alt="{{ config('app.name') }}" class="logo">
<span class="header-name">{{ config('app.name') }}</span>
</a>
</td>
</tr>
