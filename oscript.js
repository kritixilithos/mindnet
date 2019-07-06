raw={
	"n":[["parent",[0,1,2,3]],["bee",[0,4,6]],["cobra",[1,7,8]],["dingo",[2,9,15]],["elephant",[3,15,5,11]],["feline",[4,5,13]],["gorilla",[6,14,10]],["hamster",[7,10]],["iguana",[8,9]],["jellyfish",[11,12]],["kangaroo",[12]],["lion",[13]],["mongoose",[14]]],
	"e":[[1,0],[0,2],[0,3],[0,4],[5,1],[4,5],[1,6],[2,7],[2,8],[8,3],[6,7],[4,9],[9,10],[5,11],[12,6],[3,4]]
}
/*raw={
	"n":[],
	"e":[]
}*/

ns=[] //nodes
ds=[] //divs
es=[] //edges
drag=null; //dragged div index
dmX=0;dmY=0 //drag mouse x/y
cos=Math.cos
sin=Math.sin
pi=Math.PI

//init_nodes_edges()
init_nes=()=>{
	raw.n.map((q,i)=>{
		//.i,.text,.edges
		ns.push({i:i,t:q[0],es:[]/*q[1].map(i=>raw.e[i])*/})
	})
	raw.e.map(q=>{
		a=q[0];w=q[1]
		//.alpha, .omega
		tmp={a:ns[a], w:ns[w]}
		es.push(tmp)//XXX remove
		ns[a].es.push(tmp)
		ns[w].es.push(tmp)
	})
}

//init_display(index,x,y)
init_d=(i,x=0,y=0)=>{
	console.log(i)
	tmp=createDiv(ns[i].t)
	tmp.addClass("node")
	tmp.mousePressed(e=>{drag=i;ds[drag].addClass("drag");dmX=mouseX;dmY=mouseY})
	tmp.position(x,y)
	ds[i]=tmp
}

//TODO display_breadth_first_search(index,depth)
d_bfs=(i,d,x=width/2,y=height/2)=>{
	init_d(i,x,y)
	pes=ns[i].es.length
	t=0;l=100;//XXX magic
	//TODO dfs→bfs, better allocation of space
	(0<--d)&&ns[i].es.map((e,_i)=>{
		t=_i*pi/3
		console.log(t)
		_x=x+l*cos(t)
		_y=y+l*sin(t)
		if(!ds[e.a.i])d_bfs(e.a.i,d,_x,_y)
		else if(!ds[e.w.i])d_bfs(e.w.i,d,_x,_y)
	})
}

setup=()=>{
	//createCanvas(.8*windowWidth,windowHeight)
	init_nes()
	//init_d(0,width/2,height/2)
	d_bfs(0,3)
}

draw=()=>{
	background(255)
	//n_d(ns[0])
	//d_d(0)
	//upd_d(0)
}

//update_div(index,delta_x,delta_y)
upd_d=(i,dx=0,dy=0)=>{
	pos=ds[i].position()
	ds[i].position(pos.x+dx,pos.y+dy)
}

mouseDragged=()=>{
	if(drag!==null){
		/*ns[drag].x=mouseX-dX
		ns[drag].y=mouseY-dY*/
		upd_d(drag,mouseX-dmX,mouseY-dmY)
		dmX=mouseX;dmY=mouseY
	}
}
mouseReleased=()=>{
	drag!==null&&ds[drag].removeClass("drag")
	drag=null
}

/*//div_display
d_d=n=>{
	ds[n].position(ns[n].x,ns[n].y)
}*/

/*//old
//node_display
n_d=n=>{
	p=20
	x=n.x;y=n.y;w=textWidth(n.t);h=(a=textAscent())+(d=textDescent());t=n.t
	if(e_i(x,y,w+p,h+p))
		strokeWeight(5)
	else
		strokeWeight(1)
	fill(255)
	ellipse(x,y,w+p,h+p)
	fill(0)
	text(t,x-w/2,y+d)
}
//ellipse_inside
e_i=(x,y,w,h)=>(((mouseX-x)*2/w)**2 + ((mouseY-y)*2/h)**2 < 1)*/
