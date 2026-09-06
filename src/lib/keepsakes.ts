import type { Child } from '../types';
export const LANTERNS = [
  {id:'amber',name:'Amber glow',camp:null,color:'#ffe898'},
  {id:'grove',name:'Fern glow',camp:'ember-grove',color:'#a5efb0'},
  {id:'river',name:'River glass',camp:'pine-bridge',color:'#9beaff'},
  {id:'clover',name:'Clover gold',camp:'multiplying-meadow',color:'#ffc774'},
  {id:'hollow',name:'Moon lilac',camp:'division-hollow',color:'#ddbbff'},
  {id:'summit',name:'Starlight',camp:'night-sum',color:'#ffffff'},
];
export const availableLanterns = (child:Child) => LANTERNS.filter(l=>!l.camp || child.campsCleared.includes(l.camp));
export const lanternColor = (id?:string) => LANTERNS.find(l=>l.id===id)?.color ?? LANTERNS[0].color;
