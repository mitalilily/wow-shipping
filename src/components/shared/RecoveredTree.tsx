import { createElement, type CSSProperties, type ReactNode } from 'react';
import type { RecoveredNode } from '../../types/recovered';

// Keep SVG geometry, font metrics and DOM layout intact without an HTML injection sink.
const names: Record<string,string> = {
  class:'className', for:'htmlFor', tabindex:'tabIndex', viewbox:'viewBox',
  preserveaspectratio:'preserveAspectRatio', gradientunits:'gradientUnits',
  gradienttransform:'gradientTransform', clippathunits:'clipPathUnits',
  lineargradient:'linearGradient', radialgradient:'radialGradient',
  clippath:'clipPath', foreignobject:'foreignObject', textpath:'textPath',
  maskunits:'maskUnits', maskcontentunits:'maskContentUnits',
  patternunits:'patternUnits', patterncontentunits:'patternContentUnits',
  patterntransform:'patternTransform', filterunits:'filterUnits',
  stddeviation:'stdDeviation', colorinterpolationfilters:'colorInterpolationFilters',
  calcmode:'calcMode', keytimes:'keyTimes', keysplines:'keySplines',
  repeatcount:'repeatCount', attributename:'attributeName', attributetype:'attributeType',
  'xlink:href':'xlinkHref', 'xmlns:xlink':'xmlnsXlink', 'xml:space':'xmlSpace',
  autoplay:'autoPlay', playsinline:'playsInline', crossorigin:'crossOrigin',
  srcset:'srcSet', frameborder:'frameBorder', allowfullscreen:'allowFullScreen',
  maxlength:'maxLength', readonly:'readOnly', contenteditable:'contentEditable',
  spellcheck:'spellCheck', autocomplete:'autoComplete', fetchpriority:'fetchPriority',
  cellspacing:'cellSpacing', cellpadding:'cellPadding', colspan:'colSpan', rowspan:'rowSpan',
};
const booleanAttributes = new Set(['hidden','disabled','required','multiple','loop','muted','controls','autoPlay','playsInline','readOnly','allowFullScreen']);

function styleObject(text:string):CSSProperties {
  const result:Record<string,string>={};
  for (const declaration of text.split(';')) {
    const split=declaration.indexOf(':');
    if(split<0)continue;
    const property=declaration.slice(0,split).trim();
    const name=property.startsWith('--')?property:property.replace(/^-ms-/,'ms-').replace(/-([a-z])/g,(_,c:string)=>c.toUpperCase());
    result[name]=declaration.slice(split+1).trim();
  }
  return result as CSSProperties;
}

function render(node:RecoveredNode,key:string):ReactNode {
  if(typeof node==='string')return node;
  const tag=names[node.tag]||node.tag;
  const props:Record<string,unknown>={key};
  for(const [raw,value] of Object.entries(node.attrs)) {
    if(raw.startsWith('on'))continue;
    let name=names[raw]||raw;
    if(name==='style')props.style=styleObject(value);
    else if(name==='value'&&tag==='input')props.defaultValue=value;
    else if(name==='checked'&&tag==='input')props.defaultChecked=true;
    else {
      if((tag==='svg'||['path','circle','rect','g','line','polyline','polygon','ellipse','stop','text','use','mask','pattern','filter'].includes(tag)) && !raw.startsWith('data-') && !raw.startsWith('aria-'))
        name=names[raw]||raw.replace(/-([a-z])/g,(_,c:string)=>c.toUpperCase());
      props[name]=booleanAttributes.has(name)?true:value;
    }
  }
  return createElement(tag,props,...node.children.map((child,i)=>render(child,`${key}.${i}`)));
}

export function RecoveredTree({tree}:{tree:unknown}) {
  return render(tree as RecoveredNode,'section');
}
