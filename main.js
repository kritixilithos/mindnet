l=console.log
doc=document
$=q=>(a=doc.querySelectorAll(q)).length===1?a[0]:a
p=_=>_+"px";P=_=>_.slice(0,-2)
l("start")

raw={"n":[["asdas",[]]],"e":[]}

ns=[] //nodes
ds=[] //divs
es=[] //edges
c={norm:null,drag:null,add_n:null,add_e:null} //cursor meta, indices
dmX=0;dmY=0 //drag mouse x/y
cursor="norm" //norm drag add_n add_e; TODO:move to c?
cos=Math.cos;sin=Math.sin;pi=Math.PI

window.onload=()=>{
	l("onload")
	$("button").forEach(b=>{b.onclick=function(ec){rm_e_c($("#"+cursor),"sel");unsel(cursor);cursor=this.id;add_e_c(this,"sel")}})
	add_e_c($("#norm"),"sel")

	display.onmousemove=em=>{
		if(cursor==="drag")
			if(c.drag!==null){
				upd_d(c.drag,em.clientX-dmX,em.clientY-dmY)
				//upd_d(drag,em.movementX,em.movementY) XXX
				dmX=em.clientX;dmY=em.clientY
			}
	}

	display.onmouseup=eu=>{if(cursor==="drag")unsel("drag")}

	display.onclick=eu=>{
		if(cursor==="norm")(eu.target.id==="display")&&unsel("norm")
		else if(cursor==="add_n"){
			ns.push({i:ns.length,t:"",es:[]})
			init_d(ns.length-1,eu.clientX,eu.clientY)
		}
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
	raw.e.forEach(q=>{
		a=q[0];w=q[1]
		//.alpha, .omega
		tmp={a:ns[a], w:ns[w]}
		es.push(tmp)//XXX remove
		ns[a].es.push(tmp);ns[w].es.push(tmp)
	})
}

//init_display(index,x,y)
init_d=(i,x=0,y=0)=>{
	tmp=create("div")
	tmp.textContent=ns[i].t
	add_e_c(tmp,"node")
	tmp.onmousedown=ed=>{
		if(cursor==="norm"){
			ed.preventDefault()
			sel("norm",i)
			text=create("div");add_e_c(text,"info");text.id="text"
			//<span><  i  n  p  u  t  >
			span=create("span");span.textContent="text:";text.appendChild(span)
			inp=create("input");inp.value=ns[i].t
			inp.oninput=ei=>{ns[i].t=inp.value;upd_d(i)};inp.onkeydown=ek=>{ek.keyCode===13&&inp.blur()}
			text.appendChild(inp)
			$("#details").appendChild(text)
		}else if(cursor==="drag"){
			ed.preventDefault()
			sel("drag",i);dmX=ed.clientX;dmY=ed.clientY
		}
	}
	setp_d(tmp,x,y)
	ds[i]=tmp
	$("#display").appendChild(tmp)
}

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

//set_position_div(div,x,y)
setp_d=(d,x,y)=>{d.style.left=p(x);d.style.top=p(y)}

//update_div(index,delta_x,delta_y)
upd_d=(i,dx=0,dy=0)=>{
	ds[i].innerText=ns[i].t
	x=ds[i].offsetLeft;y=ds[i].offsetTop
	setp_d(ds[i],x+dx,y+dy)
}

//unselect(c.prop)
unsel=p=>{c[p]!==null&&rm_e_c(ds[c[p]],"sel");c[p]=null;rm_details()} //TODO:rm if was drag

//select(c.prop,index)
sel=(p,i)=>{unsel(p);c[p]=i;add_e_c(ds[c[p]],"sel")}

//rm_details()
rm_details=()=>{$("#details").innerHTML=""}

//add_element_class(element,class)
add_e_c=(e,c)=>e.classList.add(c)

//remove_element_class(element,class)
rm_e_c=(e,c)=>e.classList.remove(c)

//create(tag)
create=t=>doc.createElement(t)
