Shaders = {

    getParticleShader : function(){ return new THREE.ShaderMaterial({
        uniforms:{

            lookup: {type:"t", value:null}

        },

        vertexShader: [
            "uniform sampler2D lookup;",

            "void main() {",

            "vec2 lookupuv = position.xy ;",
            "vec3 pos = texture2D( lookup, lookupuv ).xyz;",
            "vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );",
            "gl_PointSize  = 1.5;",
            "gl_Position = projectionMatrix * mvPosition;",

            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform vec3 psColor;",
            "uniform float opacity;",
            "void main() {",
            "gl_FragColor = vec4( 1.0,1.0,1.0, opacity );",
            "}"

        ].join("\n")
    })},

    getPassThruShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            resolution: { type: "v2", value: null },
            texture: { type: "t", value: null }
        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join('\n'),

        fragmentShader: [
            "uniform vec2 resolution;",
            "uniform sampler2D texture;",

            "void main()	{",

            "vec2 uv = gl_FragCoord.xy / resolution.xy;",

            "vec3 color = texture2D( texture, uv ).xyz;",

            "gl_FragColor=vec4(color, 1.0);",

            "}"

        ].join("\n")





    })},

    getPositionShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            resolution: { type: "v2", value: new THREE.Vector2(PWIDTH,PWIDTH)},
            dt: { type: "f", value: null },
            textureVelocity: {type: "t", value: null},
            texturePosition: {type: "t", value: null}
        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join('\n'),

        fragmentShader: [

            "uniform vec2 resolution;",
            "uniform float dt;",
            "uniform sampler2D textureVelocity;",
            "uniform sampler2D texturePosition;",

            "const float UPPER_BOUNDS = 200.0;",
            "const float LOWER_BOUNDS = -UPPER_BOUNDS;",

            "void main()	{",


            "vec2 uv = gl_FragCoord.xy / resolution.xy;",

            "vec3 position = texture2D( texturePosition, uv ).xyz;",

            "vec3 velocity = texture2D( textureVelocity, uv ).xyz;",

            //periodic boundary box:
            "if ((position.x + velocity.x ) < LOWER_BOUNDS) position.x += UPPER_BOUNDS*2.0;",
            "if ((position.y + velocity.y ) < LOWER_BOUNDS) position.y += UPPER_BOUNDS*2.0;",
            "if ((position.z + velocity.z ) < LOWER_BOUNDS) position.z += UPPER_BOUNDS*2.0;",

            "if ((position.x + velocity.x ) > UPPER_BOUNDS) position.x -= UPPER_BOUNDS*2.0;",
            "if ((position.y + velocity.y ) > UPPER_BOUNDS) position.y -= UPPER_BOUNDS*2.0;",
            "if ((position.z + velocity.z ) > UPPER_BOUNDS) position.z -= UPPER_BOUNDS*2.0;",

            "gl_FragColor=vec4(position + velocity*dt , 1.0);",

            "}"

        ].join("\n")

    })},

    getVelocityShader: function(){return new THREE.ShaderMaterial({

        uniforms:{
            resolution: { type: "v2", value: new THREE.Vector2(PWIDTH,PWIDTH)},
            dt: { type: "f", value: null },
            textureVelocity: {type: "t", value: null},
            textureAcceleration: {type: "t", value: null}
        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join('\n'),

        fragmentShader: [
            "uniform vec2 resolution;",
            "uniform float dt;",
            "uniform sampler2D textureVelocity;",
            "uniform sampler2D textureAcceleration;",


            "void main()	{",

            "vec2 uv = gl_FragCoord.xy / resolution.xy;",
            "vec3 oldVelocity = texture2D( textureVelocity, uv ).xyz;",
            "vec3 acceleration = texture2D( textureAcceleration, uv).xyz;",

            "vec3 velocity=oldVelocity+acceleration*dt;",

            "gl_FragColor=vec4(velocity, 1.0);",

            "}"

        ].join("\n")


    })},

    getAccelerationShader: function(){return new THREE.ShaderMaterial({

        uniforms: {
            dt : { type: "f",value: gui.vars().dt},
            gy: {type: "f", value: gui.vars().gy},
            gridsize: {type: "f", value:null},
            resolution: { type: "v2", value: new THREE.Vector2(PWIDTH,PWIDTH)},
            textureVelocity: { type: "t", value: null},
            textureMQ: {type:"t", value: null},
            textureGridB: {type: "t", value: null},
            textureGridE: {type: "t", value: null},
            texturePosition: {type: "t", value: null}

        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join('\n'),

        fragmentShader: [
            "uniform float dt;",
            "uniform float gy;",
            "uniform vec2 resolution;",
            "uniform sampler2D textureVelocity;",
            "uniform sampler2D textureMQ;",

            "uniform float gridsize;",
            "uniform sampler2D textureGridB;",
            "uniform sampler2D textureGridE;",
            "uniform sampler2D texturePosition;",

            "const float drag = 0.0005;",


            "vec2 getGridPoint(vec3 pos){",

                "float maxval = 400.0;",

                //map particles position  to [0,size]
                "float x = ((pos.x+maxval/2.0)/maxval)*(gridsize);",
                "float y = ((pos.y+maxval/2.0)/maxval)*(gridsize);",
                "float z = ((pos.z+maxval/2.0)/maxval)*(gridsize);",

                //now round to nearest fp
                "float lx = floor(x);",
                "float ly = floor(y);",
                "float lz = floor(z);",

                "float width = ceil(sqrt(gridsize));",

                "float row = floor(lz/width);",
                "float col = mod(lz,width);",

                "float qu = col*(gridsize)+lx;",
                "float qv = row*(gridsize)+ly;",

                "qu = (qu+0.5)/(gridsize*width);",
                "qv = (qv+0.5)/(gridsize*width);",

                "return vec2(qu,qv);",


                "}",

            "void main()	{",

                "vec2 uv = gl_FragCoord.xy / resolution.xy;",

                "vec3 pos = texture2D(texturePosition,uv).xyz;",

                "vec2 quv = getGridPoint(pos);",


                "vec3 B = texture2D(textureGridB,quv).xyz;",
                "vec3 E = texture2D(textureGridE,quv).xyz;",

                "float q = texture2D(textureMQ,uv).y;",
                "float m = texture2D(textureMQ,uv).x;",

                "vec3 v = texture2D(textureVelocity,uv).xyz;",
                "vec3 acceleration =  -drag * v + m*gy + (q/m*(E+cross(v,B)));",

                "gl_FragColor=vec4(acceleration,1.0);",


                "}"


        ].join("\n")


    })},

    getGridEShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            dt : { type: "f",value: null},
            gridsize: {type: "f",value: gui.vars().gridsize},
            textureGridE:{type: "t",value :null},
            textureGridB:{type: "t",value :null},
            textureGridJ:{type:"t",value: null}
        },

        vertexShader: [
            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform sampler2D textureGridE;",
            "uniform sampler2D textureGridB;",
            "uniform sampler2D textureGridJ;",
            "uniform float dt;",
            "uniform float gridsize;",



            "float width = ceil(sqrt(gridsize));",

            "vec4 getSteps(vec2 uv,float h){",

                //calculate new uv vector if x changes by +h

                "float x = uv.x*(gridsize*width);",
                "float col = floor(uv.x*width);",
                "float localx = x-col*gridsize;",
                "localx = mod((localx+gridsize+h),gridsize);",
                "x=col*gridsize+localx;",

                "x = x/(gridsize*width);",


                //calculate new uv vector if y changes by +h

                "float y = uv.y*(gridsize*width);",
                "float row = floor(uv.y*width);",
                "float localy = y-row*gridsize;",
                "localy = mod((localy+gridsize+h),gridsize);",
                "y = row*gridsize+localy;",

                "y = y/(gridsize*width);",

                //calculate new uv vector if z changes by +h

                "vec2 zuv=uv;",
                "float posz = col+row*width;",
                "posz=mod((posz+gridsize+h),gridsize);",

                "float tx = uv.x*(gridsize*width);",
                "float ty = uv.y*(gridsize*width);",

                //per tile coordinate
                "localx = tx - col*gridsize;",

                "localy = ty - row*gridsize;",

                //new col and row
                "col = mod(posz,width);",
                "row = floor(posz/width);",

                "zuv.x = col * gridsize + localx;",
                "zuv.x = (zuv.x)/(gridsize*width);",

                "zuv.y = row * gridsize + localy;",
                "zuv.y = (zuv.y)/(gridsize*width);",

                "return vec4(x,y,zuv);",

            "}",


            "vec3 rotorNeg(vec2 uv){",

                "float h = 1.0;",

                "vec4 vecuv = getSteps(uv,-h);",

                "vec3 bold = texture2D(textureGridB,uv).xyz;",

                "vec3 dx = texture2D(textureGridB, vec2(vecuv.x,uv.y)).xyz;",
                "vec3 dy = texture2D(textureGridB, vec2(uv.x,vecuv.y)).xyz;",
                "vec3 dz = texture2D(textureGridB, vec2(vecuv.z,vecuv.w)).xyz;",


                "float rxl = (bold.z-dy.z)/h;",
                "float rxr = (bold.y-dz.y)/h;",

                "float ryl = (bold.x-dz.x)/h;",
                "float ryr = (bold.z-dx.z)/h;",

                "float rzl = (bold.y-dx.y)/h;",
                "float rzr = (bold.x-dy.x)/h;",


                "float rx = rxl-rxr;",
                "float ry = ryl-ryr;",
                "float rz = rzl-rzr;",


                "return vec3(rx,ry,rz);",


            "}",


            "void main(){",

                "vec2 uv = vec2(gl_FragCoord.x/(gridsize*width),gl_FragCoord.y/(gridsize*width));",


                "vec3 rotB = rotorNeg(uv);",
                "vec3 j = texture2D(textureGridJ,uv).xyz;",
                "vec3 E_old = texture2D(textureGridE,uv).xyz;",
                "vec3 E_new = E_old + dt*(rotB);//-j);",



                "gl_FragColor=vec4(E_new, 1.0);",


            "}"


        ].join("\n")

    })},

    getGridBShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            dt : { type: "f",value: null},
            gridsize: {type: "f",value: gui.vars().gridsize},
            textureGridE:{type: "t",value :null},
            textureGridB:{type: "t",value :null}

        },

        vertexShader: [

            "void main()	{",

            "gl_Position = vec4( position, 1.0 );",

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform sampler2D textureGridE;",
            "uniform sampler2D textureGridB;",
            "uniform float dt;",
            "uniform float gridsize;",


            "float width = ceil(sqrt(gridsize));",

            "vec4 getSteps(vec2 uv,float h){",

                //calculate new uv vector if x changes by +h

                "float x = uv.x*(gridsize*width);",
                "float col = floor(uv.x*width);",
                "float localx = x-col*gridsize;",
                "localx = mod((localx+h),gridsize);",
                "x=col*gridsize+localx;",

                "x = x/(gridsize*width);",


                //calculate new uv vector if y changes by +h

                "float y = uv.y*(gridsize*width);",
                "float row = floor(uv.y*width);",
                "float localy = y-row*gridsize;",
                "localy = mod((localy+h),gridsize);",
                "y = row*gridsize+localy;",

                "y = y/(gridsize*width);",


                //calculate new uv vector if z changes by +h

                "vec2 zuv=uv;",
                "float posz = col+row*width;",
                "posz=mod((posz+h),gridsize);",

                "float tx = uv.x*(gridsize*width);",
                "float ty = uv.y*(gridsize*width);",

                //per tile coordinate
                "localx = tx - col*gridsize;",

                "localy = ty - row*gridsize;",

                //new col and row
                "col = mod(posz,width);",
                "row = floor(posz/width);",

                "zuv.x = col * gridsize + localx;",
                "zuv.x = (zuv.x)/(gridsize*width);",

                "zuv.y = row * gridsize + localy;",
                "zuv.y = (zuv.y)/(gridsize*width);",

                "return vec4(x,y,zuv.x, zuv.y);",


                "}",

            "vec3 rotor(vec2 uv){",

                "float h =1.0;",
                "vec4 vecuv = getSteps(uv,h);",


                "vec3 eold = texture2D(textureGridE, uv).xyz;",
                "vec3 dx = texture2D(textureGridE, vec2(vecuv.x,uv.y)).xyz;",
                "vec3 dy = texture2D(textureGridE, vec2(uv.x,vecuv.y)).xyz;",
                "vec3 dz = texture2D(textureGridE, vec2(vecuv.z,vecuv.w)).xyz;",

                "float rxl = (dy.z-eold.z)/h;",
                "float rxr = (dz.y-eold.y)/h;",

                "float ryl = (dz.x-eold.x)/h;",
                "float ryr = (dx.z-eold.z)/h;",

                "float rzl = (dx.y-eold.y)/h;",
                "float rzr = (dy.x-eold.x)/h;",



                "float rx = rxl-rxr;",
                "float ry = ryl-ryr;",
                "float rz = rzl-rzr;",



                "return vec3(rx,ry,rz);",

            "}",


            "void main(){",

                "vec2 uv = vec2(gl_FragCoord.x/(gridsize*width),gl_FragCoord.y/(gridsize*width));",

                "vec3 rotE = rotor(uv);",
                "vec3 B_old = texture2D(textureGridB,uv).xyz;",
                "vec3 B_new = B_old - dt*rotE;",

                "gl_FragColor=vec4(B_new, 1.0);",


            "}"


        ].join("\n")

    })},

    getGridJShader: function(){return new THREE.ShaderMaterial({

        uniforms:{

            gridsize: {type: "f",value: gui.vars().gridsize},
            dt:{type:"f",value:gui.vars().dt},
            texturePosition:{type: "t",value :null},
            textureVelocity:{type: "t",value :null}


        },

        vertexShader: [

            "void main(){",
            "gl_Position = vec4( position, 1.0 );",
            "}"

        ].join("\n"),
        fragmentShader: [


        "uniform float gridsize;",
        "uniform float dt;",


        "uniform sampler2D texturePosition;",
        "uniform sampler2D textureVelocity;",
        "vec2 resolution = vec2(ceil(sqrt(gridsize))*gridsize,ceil(sqrt(gridsize))*gridsize);",


            "vec2 getGridPoint(vec3 pos){",

            "float maxval = 400.0;",

            //map particles position  to [0,size]
            "float x = ((pos.x+maxval/2.0)/maxval)*(gridsize);",
            "float y = ((pos.y+maxval/2.0)/maxval)*(gridsize);",
            "float z = ((pos.z+maxval/2.0)/maxval)*(gridsize);",

            //now round to nearest fp
            "float lx = floor(x);",
            "float ly = floor(y);",
            "float lz = floor(z);",

            "float width = ceil(sqrt(gridsize));",

            "float row = floor(lz/width);",
            "float col = mod(lz,width);",

            "float qu = col*(gridsize)+lx;",
            "float qv = row*(gridsize)+ly;",

            "qu = (qu+0.5)/(gridsize*width);",
            "qv = (qv+0.5)/(gridsize*width);",

            "return vec2(qu,qv);",


            "}",


        "void main(){",
            "float LOWER_BOUNDS = -200.0;",
            "float UPPER_BOUNDS = 200.0;",
            "vec2 uv = gl_FragCoord.xy/resolution.xy;",
            "vec3 j = vec3(0.0,0.0,0.0);",


            "for(int x = 0; x<100;x++){",

                "for(int y = 0; y<100;y++){",

                    "vec2 look = vec2((float(x)+0.5)/100.0,(float(y)+0.5)/100.0);",
                    "vec3 position = texture2D(texturePosition,look).xyz;",
                    "vec3 velocity = texture2D(textureVelocity,look).xyz;",
                    "vec2 gp = getGridPoint(position);",
                    "if(abs(gp.x-uv.x)<=0.001&&abs(gp.y-uv.y)<=0.001){",

                         "j+=velocity*0.001;",//scale it down a little
                         //"j=vec3(0.0,0.01,0.02);",

                    "}",

                "}",

            "}",


           "gl_FragColor=vec4(j,1.0);",


        "}"

        ].join("\n")

    })},

    getVectorEShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            gridsize:{type: "f", value: gui.vars().gridsize},
            textureGridE:{type:"t", value:null}
        },

        vertexShader : [


        "uniform sampler2D textureGridE;",
        "uniform float gridsize;",


        "vec2 getUV(vec3 pos){",


            "float maxval = 400.0;",

            //map particles position  to [0,size]
            "float x = ((pos.x+maxval/2.0)/maxval)*(gridsize);",
            "float y = ((pos.y+maxval/2.0)/maxval)*(gridsize);",
            "float z = ((pos.z+maxval/2.0)/maxval)*(gridsize);",

            //now round to nearest fp
            "float lx = floor(x);",
            "float ly = floor(y);",
            "float lz = floor(z);",


            "float width = ceil(sqrt(gridsize));",


            "float row = floor(lz/width);",
            "float col = mod(lz,width);",


            "float qu = col*(gridsize)+lx;",
            "float qv = row*(gridsize)+ly;",



            "qu = (qu+0.5)/(gridsize*width);",
            "qv = (qv+0.5)/(gridsize*width);",


            "return vec2(qu,qv);",


        "}",

        "void main() {",


            "vec4 mvPosition;",

            "mvPosition = modelViewMatrix * vec4( position, 1.0 );",


            "if(position.y>200.0){",
                "vec2 uv = getUV(vec3(position.x,position.y-1000.0,position.z));",
                "vec3 E = texture2D(textureGridE,uv).xyz;",
                "vec3 pos = vec3(position.x,position.y-1000.0,position.z);",
                "pos = pos +E*200.0;",//200 visibility factor
                "mvPosition = modelViewMatrix * vec4(pos,1.0);",
            "}",

            "gl_Position = projectionMatrix * mvPosition;",


        "}"

        ].join('\n'),

        fragmentShader : [
            "vec3 vColor = vec3(1.0,0.0,1.0);",

            "void main() {",

            "gl_FragColor =  vec4( vColor, 1.0 );",

            "}"
        ].join('\n')

    })},

    getVectorBShader: function(){return new THREE.ShaderMaterial({
        uniforms:{
            gridsize:{type: "f", value: gui.vars().gridsize},
            textureGridB:{type:"t", value:null}
        },

        vertexShader : [
            "uniform sampler2D textureGridB;",
            "uniform float gridsize;",


            "vec2 getUV(vec3 pos){",


            "float maxval = 400.0;",

            //map particles position  to [0,size]
            "float x = ((pos.x+maxval/2.0)/maxval)*(gridsize);",
            "float y = ((pos.y+maxval/2.0)/maxval)*(gridsize);",
            "float z = ((pos.z+maxval/2.0)/maxval)*(gridsize);",

            //now round to nearest fp
            "float lx = floor(x);",
            "float ly = floor(y);",
            "float lz = floor(z);",


            "float width = ceil(sqrt(gridsize));",


            "float row = floor(lz/width);",
            "float col = mod(lz,width);",


            "float qu = col*(gridsize)+lx;",
            "float qv = row*(gridsize)+ly;",



            "qu = (qu+0.5)/(gridsize*width);",
            "qv = (qv+0.5)/(gridsize*width);",


            "return vec2(qu,qv);",


            "}",

            "void main() {",


            "vec4 mvPosition;",

            "mvPosition = modelViewMatrix * vec4( position, 1.0 );",


            "if(position.y>200.0){",
            "vec2 uv = getUV(vec3(position.x,position.y-1000.0,position.z));",
            "vec3 B = texture2D(textureGridB,uv).xyz;",
            "vec3 pos = vec3(position.x,position.y-1000.0,position.z);",
            "pos = pos +B*200.0;//200 is visibility factor",
            "mvPosition = modelViewMatrix * vec4(pos,1.0);",
            "}",

            "gl_Position = projectionMatrix * mvPosition;",


            "}"


        ].join('\n'),

        fragmentShader : [
            "vec3 vColor = vec3(1.0,1.0,0.0);",

            "void main() {",

            "gl_FragColor =  vec4( vColor, 1.0 );",

            "}"
        ].join('\n')


    })}

}