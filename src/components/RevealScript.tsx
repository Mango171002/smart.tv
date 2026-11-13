/**
 * Scroll-reveal for the category cards, the plan cards and the FAQ: the items
 * of every [data-reveal] list slide in from the right, one after the other,
 * when the list enters the viewport. Plain inline script (no hydration needed)
 * so the cards above the fold animate as soon as the page opens. Lists rendered
 * later (lazy islands) are picked up by a MutationObserver. Nothing is hidden
 * when JavaScript is off or the visitor prefers reduced motion.
 */
const SCRIPT = `(function(){try{
var d=document.documentElement;
if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.hero-video').forEach(function(v){v.removeAttribute('autoplay');v.pause();});});return;}
if(!('IntersectionObserver' in window))return;
d.classList.add('rv');
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});},{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
function scan(){document.querySelectorAll('[data-reveal]:not([data-rv])').forEach(function(el){el.setAttribute('data-rv','');io.observe(el);});}
scan();
document.addEventListener('DOMContentLoaded',function(){scan();document.querySelectorAll('.hero-video').forEach(function(v){v.addEventListener('animationiteration',function(){try{v.currentTime=0;v.play();}catch(e){}});});});
new MutationObserver(scan).observe(d,{childList:true,subtree:true});
}catch(e){document.documentElement.classList.remove('rv');}})();`;

export function RevealScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
