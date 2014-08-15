


#openpixi_javascript


##Introduction:


Javascript version of OpenPixi

This is the JavaScript version of OpenPixi. It uses three.js for creating webGL content and dat.gui
for the user interface. Mind that it is still a work in progress.

To work with the code some knowledge of JavaScript and general understanding ofthe graphics pipeline is needed. 
Furhtermore you should have a look at the three.js and dat.gui documentation and the OpenGL Shading Language (GLSL).


##About the Program:


###Program Overview

The program uses textures as a means of storing information about the particles and grid points.
This is done by storing these values as the red, green and blue values of a pixel. A velocity vector of
(0,1,0) would result in a bright red pixel color. Each pixel is assigned one particle.
These textures are rendered to a full screen quad in an off-screen scene, from where they can be read by
a fragment shader, which in turn updates the values. Since the shader cannot write to the same texture it reads from, 
the values are then updated and the texture is written to another texture. This process is often referred to as
ping-pong-rendering. This way the GPU's computing powers can be used to our advantage.

The particle system is modelled as a geometry where each vertex represents a particle. A vertex shader
then in turn reads the particle's position from the respective texture and updates the vertex position.
The lookup is done through the particle's unique initial position along the X and Y axis.

The program itself is organized into a simulator which renders the scene and the objects therein to the screen
and a texture processor which handles the ping pong rendering. So for each frame the simulator gets the newly 
updated textures from the texture processor and updates the particle system and the vectors.

###Ping-Pong-Rendering

The following things are needed for ping pong rendering in our case: 
 
* a separate scene aswell as camera and a full screen quad to which the textures can be bound

   the quad is a simple mesh created using the THREE.PlaneGeometry, the camera is positioned in a way that the mesh
   appears full screen. The mesh is part of this off-screen scene. A scene-object consists of a geometry and a material.
   In our case the material is a custom THREE.ShaderMaterial.
* two textures

   Textures are created through an array filled with data which first is made into a data texture and then
   rendered to a FBO using the pass-through shader. Have a look at the code in the texture generator to find
   out how exactly textures are created.
* the same renderer we use for the on-screen scene

   only this time we render to a texture not the screen.   
* a shader which is applied to the quad when rendering

   for updating the texture values a pass through vertex shader is used resulting in no change in the quad geometry.
   The fragment shader then updates the values. Shaders.js contains all of the shader code. The input is handled via
   a list of uniforms, which are accessible both in vertex and fragment shader and remain unchanged for each render pass.
   They are updated every frame before the updated texture is being rendered.



###Updating particle position and vector direction/length

The vertices of the particle and vector systems are updates using a vertex shader and a pass through fragment shader.
After updating the lookup-texture, the respective pixel for every vertex(particle) on the texture is found, the values
read and the position updated accordingly.
While the lookup for the particles is pretty straight forward, the textures for the grid points are organized in a
more complex way:
The k^3 gridpoints are organized as z x*y tiles inside a larger texture as in the picture below. Each grid point
can now be looked up by choosing a tile index according to the z position and the x and y coordinate inside that tile.
The position (0,0,0) relates to the bottom left pixel, while (k,k,k) would be the bottom right pixel of the last tile.
Have a look at getUV() inside the acceleration shader for details about how the correct grid point for each position is found.

![texture](https://raw.githubusercontent.com/openpixi/openpixi_javascript/master/img.png)


##Usage:

After downloading you can run it by opening index.html in a browser of your choice. 
So far it has been tested successfully in Google Chrome, Mozilla Firefox and Internet Explorer. 
Note that in order to make it run floating-point textures and vertex shader textures need to be
supported on your device. 

A few variables can be changed using the GUI. To make the particles move a value for E, m and q must be set.
To apply changes, reset needs to be clicked.
Currently particle movement and solving of the Lorentz-equation are implemented. Solving of the 
Maxwell Equations is under way.

To edit the source code you can use any IDE that supports HTML and JavaScript or just a simple text
editor.


##External links

* threejs

   
   * http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene

   * http://threejs.org/docs/

   * http://threejs.org/examples/

   * https://github.com/mrdoob/three.js/wiki


* dat.gui

   * http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage

* shaders in threejs

   * http://aerotwist.com/tutorials/an-introduction-to-shaders-part-1/

* glsl

   * http://nehe.gamedev.net/article/glsl_an_introduction/25007/
   * http://www.khronos.org/opengles/sdk/docs/reference_cards/OpenGL-ES-2_0-Reference-card.pdf

	


