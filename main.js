'use strict'
//TODO:
//addition/deletion of nodes/edges
//storage and loading
//customisable nodes/edges
//search

var l=console.log,doc=document
//XXX:if(q[0]==='#')
//$=q=>(a=doc.querySelectorAll(q)).length===1?a[0]:a
var $=q=>q.startsWith('#')?doc.querySelector(q):doc.querySelectorAll(q)
var p=_=>_+'px',P=_=>_.slice(0,-2)
l('start')

var raw={'n':[['asdas',[]]],'e':[]}

var ns=[] //nodes, .i .t .es
var ds=[] //divs (of nodes)
var es=[] //edges TODO:remove?, .i .a .w
var ss=[] //'svgs' (of edges)
var c={norm:null,drag:null,add_n:null,add_e:null} //cursor meta, prop:index
var msel=[] //selected nodes other than the first one, ie multiselect
var dmX=0,dmY=0 //drag mouse x/y
var cursor='norm' //norm drag add_n add_e; TODO:move to c?

window.onload=()=>{
	l('onload')
	$('button').forEach(b=>{b.onclick=function(ec){rm_e_c($('#'+cursor),'sel');unsel(cursor);unmsel();cursor=this.id;add_e_c(this,'sel')}})
	add_e_c($('#norm'),'sel')

	display.onmousemove=em=>{
		if(cursor==='drag')
			if(c.drag!==null){
				upd_d(ds[c.drag],em.clientX-dmX,em.clientY-dmY)//node
				ns[c.drag].es.forEach(e=>upd_si(e.i))//edges
				dmX=em.clientX;dmY=em.clientY
			}
	}

	//change `cursor`  via keycode
	doc.onkeyup=(ek,k=ek.keyCode,q=(k===27?'norm':k===68?'drag':k===78?'add_n':k===69?'add_e':''))=>{ek.target.tagName!=='INPUT'&&(q&&$('#'+q).click())}

	display.onmouseup=eu=>{if(cursor==='drag')unsel('drag')}

	display.onclick=eu=>{
		if(cursor==='norm')(eu.target.id==='display')&&unsel('norm')
		else if(cursor==='add_n'){ns.push({i:ns.length,t:'',es:[]});init_d(ns.length-1,eu.clientX,eu.clientY);$('#norm').click()}
	}

	init_nes()
	d_bfs(0,0)
}

//init_nodes_edges()
var init_nes=()=>{
	raw.n.forEach((q,i)=>{
		//.i,.text,.edges
		ns.push({i:i,t:q[0],es:[]})
	})
	raw.e.forEach((q,i)=>{
		var a=q[0],w=q[1]
		//.i,.alpha,.omega
		var tmp={i:i,a:ns[a],w:ns[w]}
		es.push(tmp)//XXX remove
		ns[a].es.push(tmp);ns[w].es.push(tmp)
	})
}

//init_div(index,x,y)
var init_d=(i,x=0,y=0)=>{
	var tmp=create('div','node');tmp.textContent=ns[i].t;tmp.i=i
	tmp.onclick=ev=>{
		if(cursor==='norm'){
			ev.preventDefault();sel('norm',i);det(i)
		}else if(cursor==='add_e'){
			if(c.add_e===null)sel('add_e',i)
			else{
				var tmpe={i:es.length,a:ns[c.add_e],w:ns[i]}
				ns[c.add_e].es.push(tmpe);ns[i].es.push(tmpe);es.push(tmpe)
				init_s(es.length-1);unsel('add_e')
			}
		}
	}
	tmp.onmousedown=ed=>{
		if(cursor==='drag'){ed.preventDefault();sel('drag',i);dmX=ed.clientX;dmY=ed.clientY}
	}
	setp_d(tmp,x,y);ds[i]=tmp;add_p_ch($('#display'),tmp)
}

//details(index)
var det=i=>{
	//delete button
	var del=create('button');del.id='del';del.textContent='delete node'
	del.onclick=ec=>{
		ns[i].es.forEach(e=>{
			var nod=e.a.i===i?e.w:e.a;nod.es.splice(nod.es.indexOf(e),1)
			rm_p_ch($('#display'),ss[e.i]);ss[e.i]=null;es[e.i]=null
		})
		c.norm=null;rm_p_ch($('#display'),ds[i]);ds[i]=null;ns[i]=null;$('#norm').click()
	}

	//change text
	//<input>
	var inp=create('input');inp.value=ns[i].t
	//upd_si because centre of node changes
	inp.oninput=ei=>{ds[i].textContent=ns[i].t=inp.value;upd_d(ds[i]);ns[i].es.forEach(e=>upd_si(e.i))}
	inp.onkeydown=ek=>{ek.keyCode===13&&inp.blur()}

	//#edges
	// tmp|.fromto
	//  aw[0]|span.b med|to aw[1]|span.b # <node> to <node>
	var edges=create('div','info');edges.id='edges'
	ns[i].es.forEach(e=>{
		var tmp=create('div','fromto'),aw=[create('span','b'),create('span','b')],med=create('span')
		var awe=[e.a,e.w];add_e_c(aw[+(e.a.i!==i)],'sel')
		aw.forEach((q,j)=>{q.innerText=awe[j].t;q.i=awe[j].i});med.innerText='to'
		//click to sel node & hover to msel node
		var otr=aw[+(e.a.i===i)]
		otr.onclick=function(ev){unmsel();ds[this.i].click()}
		otr.onmouseenter=function(ev){msel.push(this.i);add_e_c(ds[this.i],'msel')};otr.onmouseleave=ev=>{unmsel()}
		add_p_ch(edges,add_p_ch(tmp,aw[0],med,aw[1]))
	})
	add_p_ch($('#details'),del,inp,edges)
}

//init_svg(index)
var init_s=i=>{add_p_ch($('#display'),ss[i]=create('div','edge'));upd_si(i)}

//set_position_div(div,x,y)
var setp_d=(d,x,y)=>{d.style.left=p(x);d.style.top=p(y)}

//set_position_svg(div,x1,y1,x2,y2)
var setp_s=(d,x1,y1,x2,y2)=>{
	var w=d.style.width=Math.hypot(x2-x1,y2-y1)
	setp_d(d,(x1+x2-w)/2,(y1+y2)/2)
	d.style.transform=`rotate(${Math.atan2(y2-y1,x2-x1)}rad)`
}

//get_position_div(div)
var getp_d=d=>([d.offsetLeft+d.offsetWidth/2,d.offsetTop+d.offsetHeight/2])

//TODO:rename to updp_d et updp_s
//update_div(div,delta_x,delta_y,edge=false)
var upd_d=(d,dx=0,dy=0)=>{setp_d(d,d.offsetLeft+dx,d.offsetTop+dy)}

//update_svg_index(index)
var upd_si=i=>{setp_s(ss[i],...getp_d(ds[es[i].a.i]),...getp_d(ds[es[i].w.i]))}

//unselect(c.prop)
var unsel=p=>{c[p]!==null&&rm_e_c(ds[c[p]],'sel');c[p]=null;rm_details()} //TODO:rm if was drag
var unmsel=()=>{msel.forEach(i=>rm_e_c(ds[i],'msel'));msel=[]}

//select(c.prop,index)
var sel=(p,i)=>{unsel(p);c[p]=i;add_e_c(ds[c[p]],'sel')}

//rm_details()
var rm_details=()=>{$('#details').innerHTML=''}

//add_element_class(element,class)
var add_e_c=(e,c)=>e.classList.add(c)

//add_parent_children(parent,...children)
var add_p_ch=(p,...c)=>(c.forEach(ch=>p.appendChild(ch)),p)

//remove_parent_children(parent,...children)
var rm_p_ch=(p,...c)=>(c.forEach(ch=>p.removeChild(ch)),p)

//remove_element_class(element,class)
var rm_e_c=(e,c)=>e.classList.remove(c)

//create(tag,class)
var create=(t,c=undefined,tmp=doc.createElement(t))=>(c&&add_e_c(tmp,c),tmp)

//TODO display_breadth_first_search(index,depth)
var d_bfs=(i,d,x=display.offsetWidth/2,y=display.offsetHeight/2)=>{
	init_d(i,x,y)
	var pes=ns[i].es.length
	var t=0,L=100;//XXX magic
	//TODO dfs→bfs, better allocation of space
	(0<--d)&&ns[i].es.forEach((e,_i)=>{
		var t=_i*pi/3
		l(t)
		//_x=x+L*cos(t)
		//_y=y+L*sin(t)
		if(!ds[e.a.i])d_bfs(e.a.i,d,_x,_y)
		else if(!ds[e.w.i])d_bfs(e.w.i,d,_x,_y)
	})
}
