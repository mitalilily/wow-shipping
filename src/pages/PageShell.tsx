import {useRef,type ReactNode} from 'react';
import {Header} from '../components/navigation/Header';
import {Footer} from '../components/footer/Footer';
import {usePageMotion} from '../motion/usePageMotion';
export function PageShell({children,className=''}:{children:ReactNode,className?:string}){const root=useRef<HTMLDivElement>(null);usePageMotion(root);return <div ref={root} className={`wow-page ${className}`}><Header/><main id="main-content">{children}</main><Footer/></div>}
