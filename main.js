//TODO:
//addition/deletion of nodes/edges
//storage and loading
//customisable nodes/edges
//search

l=console.log
doc=document
//XXX:if(q[0]==='#')
//$=q=>(a=doc.querySelectorAll(q)).length===1?a[0]:a
$=q=>q.startsWith('#')?doc.querySelector(q):doc.querySelectorAll(q)
p=_=>_+'px';P=_=>_.slice(0,-2)
l('start')

raw={'n':[['asdas',[]]],'e':[]}

ns=[] //nodes
ds=[] //divs (of nodes)
es=[] //edges TODO:remove?
ss=[] //'svgs' (of edges)
c={norm:null,drag:null,add_n:null,add_e:null} //cursor meta, prop:index
msel=[] //selected nodes other than the first one, ie multiselect
dmX=0;dmY=0 //drag mouse x/y
cursor='norm' //norm drag add_n add_e; TODO:move to c?
cos=Math.cos;sin=Math.sin;pi=Math.PI

window.onload=()=>{
	l('onload')
	$('button').forEach(b=>{b.onclick=function(ec){rm_e_c($('#'+cursor),'sel');unsel(cursor);cursor=this.id;add_e_c(this,'sel')}})
	add_e_c($('#norm'),'sel')

	display.onmousemove=em=>{
		if(cursor==='drag')
			if(c.drag!==null){
				upd_d(ds[c.drag],delx=em.clientX-dmX,dely=em.clientY-dmY)//node
				ns[c.drag].es.forEach(e=>upd_si(e.i))//edges
				dmX=em.clientX;dmY=em.clientY
			}
	}

	//change `cursor`  via keycode
	doc.onkeyup=ek=>{ek.target.tagName!=='INPUT'&&(k=ek.keyCode,q=(k===27?'norm':k===68?'drag':k===78?'add_n':k===69?'add_e':''),q&&$('#'+q).click())}

	display.onmouseup=eu=>{if(cursor==='drag')unsel('drag')}

	display.onclick=eu=>{
		if(cursor==='norm')(eu.target.id==='display')&&unsel('norm')
		else if(cursor==='add_n'){ns.push({i:ns.length,t:'',es:[]});init_d(ns.length-1,eu.clientX,eu.clientY);$('#norm').click()}
	}

	init_nes()
	d_bfs(0,0)
}

//init_nodes_edges()
init_nes=()=>{
	raw.n.forEach((q,i)=>{
		//.i,.text,.edges
		ns.push({i:i,t:q[0],es:[]})
	})
	raw.e.forEach((q,i)=>{
		a=q[0];w=q[1]
		//.i,.alpha,.omega
		tmp={i:i,a:ns[a],w:ns[w]}
		es.push(tmp)//XXX remove
		ns[a].es.push(tmp);ns[w].es.push(tmp)
	})
}

//init_div(index,x,y)
init_d=(i,x=0,y=0)=>{
	tmp=create('div','node');tmp.textContent=ns[i].t
	tmp.onmousedown=ed=>{
		if(cursor==='norm'){
			ed.preventDefault();sel('norm',i);det(i)
		}else if(cursor==='drag'){
			ed.preventDefault();sel('drag',i);dmX=ed.clientX;dmY=ed.clientY
		}else if(cursor==='add_e'){
			if(c.add_e===null)sel('add_e',i)
			else{
				tmp={i:es.length,a:ns[c.add_e],w:ns[i]}
				ns[c.add_e].es.push(tmp);ns[i].es.push(tmp);es.push(tmp)
				init_s(es.length-1);unsel('add_e')
			}
		}
	}
	setp_d(tmp,x,y);ds[i]=tmp;add_p_ch($('#display'),tmp)
}

//details(index)
det=i=>{
	//change text
	text=create('div','info');text.id='text'
	//<span><  i  n  p  u  t  >
	span=create('span');span.textContent='text:';inp=create('input');inp.value=ns[i].t
	add_p_ch(text,span,inp)
	//upd_si because centre of node changes
	inp.oninput=ei=>{ds[i].textContent=ns[i].t=inp.value;upd_d(ds[i]);ns[i].es.forEach(e=>upd_si(e.i))}
	inp.onkeydown=ek=>{ek.keyCode===13&&inp.blur()}

	//#edges
	// .fromto
	//  span.b to span.b # <node> to <node>
	edges=create('div','info');edges.id='edges'
	// TODO click to go to node
	ns[i].es.forEach(e=>{
		tmp=create('div','fromto');from=create('span','b');med=create('span');to=create('span','b')
		add_e_c(e.a.i===i?from:to,'sel')
		from.innerText=e.a.t;med.innerText='to';to.innerText=e.w.t
		add_p_ch(edges,add_p_ch(tmp,from,med,to))
	})
	add_p_ch($('#details'),text,edges)
}

//init_svg(index)
init_s=i=>{add_p_ch($('#display'),ss[i]=create('div','edge'));upd_si(i)}

//set_position_div(div,x,y)
setp_d=(d,x,y)=>{d.style.left=p(x);d.style.top=p(y)}

//set_position_svg(div,x1,y1,x2,y2)
setp_s=(d,x1,y1,x2,y2)=>{
	d.style.width=w=Math.hypot(x2-x1,y2-y1)
	setp_d(d,(x1+x2-w)/2,(y1+y2)/2)
	d.style.transform=`rotate(${Math.atan2(y2-y1,x2-x1)}rad)`
}

//get_position_div(div)
getp_d=d=>([d.offsetLeft+d.offsetWidth/2,d.offsetTop+d.offsetHeight/2])

//TODO:rename to updp_d et updp_s
//update_div(div,delta_x,delta_y,edge=false)
upd_d=(d,dx=0,dy=0)=>{x=d.offsetLeft;y=d.offsetTop;setp_d(d,x+dx,y+dy)}

//update_svg_index(index)
upd_si=i=>{setp_s(ss[i],...getp_d(ds[es[i].a.i]),...getp_d(ds[es[i].w.i]))}

//unselect(c.prop)
unsel=p=>{c[p]!==null&&rm_e_c(ds[c[p]],'sel');c[p]=null;rm_details()} //TODO:rm if was drag

//select(c.prop,index)
sel=(p,i)=>{unsel(p);c[p]=i;add_e_c(ds[c[p]],'sel')}

//rm_details()
rm_details=()=>{$('#details').innerHTML=''}

//add_element_class(element,class)
add_e_c=(e,c)=>e.classList.add(c)

//add_parent_children(parent,...children)
add_p_ch=(p,...c)=>(c.forEach(ch=>p.appendChild(ch)),p)

//remove_element_class(element,class)
rm_e_c=(e,c)=>e.classList.remove(c)

//create(tag,class)
create=(t,c=undefined,tmp=doc.createElement(t))=>(c&&add_e_c(tmp,c),tmp)

//TODO display_breadth_first_search(index,depth)
d_bfs=(i,d,x=display.offsetWidth/2,y=display.offsetHeight/2)=>{
	init_d(i,x,y)
	pes=ns[i].es.length
	t=0;L=100;//XXX magic
	//TODO dfs→bfs, better allocation of space
	(0<--d)&&ns[i].es.forEach((e,_i)=>{
		t=_i*pi/3
		console.log(t)
		_x=x+L*cos(t)
		_y=y+L*sin(t)
		if(!ds[e.a.i])d_bfs(e.a.i,d,_x,_y)
		else if(!ds[e.w.i])d_bfs(e.w.i,d,_x,_y)
	})
}
