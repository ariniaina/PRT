// declare namespace
var STRUCTURE = STRUCTURE || {};

///////////////////////////////////////////////////////////////////////////////
STRUCTURE.Vertex = function(params)
{
    this.ID = -1;
	this.type = "vertex";
    this.vector3 = new THREE.Vector3(); // coordonnees
    this.edgeIDs = []; // length n
    this.faceIDs = []; // length n
   
    setParameters(this, params);   
}

STRUCTURE.Edge = function(params)
{
    this.ID = -1;
    this.type = "edge";
    this.center    = new THREE.Vector3(); // midpoint
    this.vertexIDs = []; // length 2
    this.faceIDs   = []; // length 2
   
    setParameters(this, params);   
}

STRUCTURE.Face = function (params)
{
   this.ID = -1;
   this.type = "face";
   this.center    = new THREE.Vector3(); // centroid
   this.vertexIDs = []; // length n
   this.edgeIDs   = []; // length n
   this.colorID = -1;
   
   setParameters(this, params);   
} 
