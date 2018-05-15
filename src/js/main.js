			//Vérification des possibilités WebGL
			//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
			/* variables globales */
			var meshPLY;
			var container, raycaster, mouse = { x: 0, y: 0 };
			var camera, scene, renderer;
			var theShadowLight;
			var targetList = [];
			var count = 0;
			var actif = false;
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;
			var intersects;
			var info;
			var com;
			var zones = new Array();
			var nb_zones = 0;
			var zone = new Array(); // nouvelle zone à insérer
			var nb_polys = 0; // variable temporaire qui servira à stocker les polygones
			var insert; // insertion d'un polygone dans une zone
			var texte = ''; // texte à afficher dans le canvas
			var index;
			// faire un "tableau de tableaux"
			// variable nombre de zones
			// une case du tableau va stocker les indices des faces d'un côté
			// de l'autre, on a les commentaires

				// Lancement du rendu
				init();
				animate();

			function init() {

				container = document.getElementById( 'container' );

				var canvas = document.createElement( 'canvas' );
					canvas.width = 128;
					canvas.height = 128;

				var context = canvas.getContext( '2d' );
				context.fillRect( 0, 0, canvas.width, canvas.height );
				
				// Commentaire ici !
				
				var canvas2 = document.createElement( 'canvas' );
				info = document.getElementById('info');
					var ctx = canvas2.getContext( '2d' );
					
					info.style.textAlign = 'left';
					info.style.color = '#000';
					info.style.backgroundColor = 'white';
					
				document.body.appendChild( info );

				var lightBox = 6.0;

				//Caméra
				camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 10000 );
					camera.position.z = lightBox;
					cameraTarget = new THREE.Vector3( 0, 0, 0 );

				//Contrôles
				controls = new THREE.TrackballControls( camera );
					controls.rotateSpeed = 5.0;
					controls.zoomSpeed = 1;
					controls.panSpeed =1;

					controls.noZoom = false;
					controls.noPan = false;

					controls.staticMoving = true;
					controls.dynamicDampingFactor = 0.3;
					
					controls.enabled = false;
					
				// datGUI controls objets
				var gui = new dat.GUI(),
					folder = gui.addFolder( "Trackballs" ),
					props = {
						get 'Activé'() { return controls.enabled; },
						set 'Activé'( actif ) {
								controls.enabled = actif;
								if ( ! actif ) controls.enabled = false; },

					};

				folder.add( props, 'Activé' ).listen();

				//Création de la scène
				scene = new THREE.Scene();
				
				// Grid

				/*var gridHelper = new THREE.GridHelper( 1000, 100 );
				gridHelper.position.y = - 50;
				scene.add( gridHelper );*/
				
				// Piste
				var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
				floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
				floorTexture.repeat.set( 10, 10 );
				var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
				var floorGeometry = new THREE.PlaneGeometry(15, 20);
				var floor = new THREE.Mesh(floorGeometry, floorMaterial);
				floor.position.y = -1.5;
				floor.rotation.x = Math.PI / 2;
				floor.name = "Checkerboard Floor";
				scene.add(floor);

				//Mise en place des lumières
				scene.add( new THREE.AmbientLight( 0xffffff ) );
				addTheShadowedLight( camera.position.x, camera.position.y, camera.position.z, 0xaaaaaa, 5 );

					//fichier source du maillage, SUZANNE.PLY, loader ply
					var sourcePLY = 'data/suzanne.ply'
					console.log("viewMesh Ply : "+sourcePLY);

					var loaderPLY = new THREE.PLYLoader();
					// Charger la geometrie du maillage
					loaderPLY.load(sourcePLY, function ( geometryPLY ) {
						
						geometryPLY.computeFaceNormals();
							geometryPLY.computeVertexNormals();
							geometryPLY.computeFlatVertexNormals();
							geometryPLY.computeBoundingBox();
							geometryPLY.computeBoundingSphere();
							geometryPLY.elementsNeedUpdate = false;
							
						var centrePLY = new THREE.Vector3();
							centrePLY.x = ( geometryPLY.boundingBox.max.x + geometryPLY.boundingBox.min.x ) / 2.0;
							centrePLY.y = ( geometryPLY.boundingBox.max.y + geometryPLY.boundingBox.min.y ) / 2.0;
							centrePLY.z = ( geometryPLY.boundingBox.max.z + geometryPLY.boundingBox.min.z ) / 2.0;

						geometryPLY.computeBoundingSphere();
						// Definir le materiel qu'on va utilisé pour decrire la geometrie(couleur, emmision de lumiere...)
						var materialPLY = new THREE.MeshLambertMaterial({color: 0x443322, vertexColors: THREE.FaceColors} );
						
						meshPLY = new THREE.Mesh( geometryPLY, materialPLY );
							meshPLY.position.set( -centrePLY.x, -centrePLY.y, -centrePLY.z);
							meshPLY.castShadow = true;
							meshPLY.receiveShadow = true;
							meshPLY.name = "aaaaaaaaa";

						scene.add( meshPLY );
						targetList.push(meshPLY);
					});

					//fichier source du maillage, STATUES.CTM, loader ctm
					/*var sourceCTM = 'data/statues.ctm'
					console.log("viewMesh CTM : "+sourceCTM);

					var loaderCTM = new THREE.CTMLoader();

					loaderCTM.load(sourceCTM, function ( geometryCTM ) {

						geometryCTM.computeFaceNormals();
							geometryCTM.computeVertexNormals();
							geometryCTM.computeBoundingBox();

						var centreCTM = new THREE.Vector3();
							centreCTM.x = ( geometryCTM.boundingBox.max.x + geometryCTM.boundingBox.min.x ) / 2.0;
							centreCTM.y = ( geometryCTM.boundingBox.max.y + geometryCTM.boundingBox.min.y ) / 2.0;
							centreCTM.z = ( geometryCTM.boundingBox.max.z + geometryCTM.boundingBox.min.z ) / 2.0;

						geometryCTM.computeBoundingSphere();

						var materialCTM = new THREE.MeshLambertMaterial({color: 0x443322 } );

						var meshCTM = new THREE.Mesh( geometryCTM, materialCTM );
							meshCTM.position.set( -centreCTM.x, -centreCTM.y, -centreCTM.z);
							meshCTM.castShadow = true;
							meshCTM.receiveShadow = true;

						scene.add( meshCTM );
					});*/

				renderer = new THREE.WebGLRenderer( { antialias: true} );
					renderer.setClearColor( 0xf5f6c9 );
					renderer.setPixelRatio( window.devicePixelRatio );
					renderer.setSize( window.innerWidth, window.innerHeight );

					renderer.shadowMap.enabled = true;
					//renderer.shadowMap.cullFace = THREE.CullFaceFront;//deprecated in v89
					renderer.shadowMap.renderReverseSided = true; //v89

				container.appendChild( renderer.domElement );
				
				

				window.addEventListener( 'resize', onWindowResize, false );
				document.addEventListener("keydown", clavierEvent, false);
				document.addEventListener( 'mousemove', onMouseMove, false );
				document.addEventListener( 'mousedown', onMouseDown, false );
				document.addEventListener( 'mouseup', onMouseUp, false );
				
			}
			
			function onMouseMove(event)
			{
				/*if(!mouseDown)
				{
					return;
				}*/
				
				// tester si la souris est cliquée et si elle bouge
				if(actif == true && controls.enabled == false)
				{
				//event.preventDefault();
				
				// calculer la position de la souris dans les coordonnées du périphérique normalisé (-1 à + 1) pour les deux composants
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
				
				//var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
				raycaster = new THREE.Raycaster();

				raycaster.setFromCamera(mouse, camera);

				// Créer un tableau contenant tous les objets de la scène avec laquelle le rayon se croise
				intersects = raycaster.intersectObjects(targetList);

				// S'il y a une (ou plusieurs) intersections
					if (intersects.length > 0) 
					{
						//console.log("Hit @ " + toString( intersects[0].face ) );
						console.log("Coord.intersection @ " + toString( intersects[0].point ) );
						console.log("face Index: " + intersects[0].faceIndex);
						// changer la couleur de la face
						intersects[0].face.color.setRGB( 0.8 * Math.random() + 0.2, 0, 0 ); 
						intersects[0].object.geometry.colorsNeedUpdate = true;
						//info.innerHTML = '<br/>Nombre d\'intersection: ' + ++count;
						//info.innerHTML = '<br/>Position X : ' + event.clientX + 'px<br />Position Y : ' + event.clientY + 'px';
						//info.innerHTML = '<br/>Face index: ' + intersects[0].faceIndex;
						console.log("Position de la souris :  X=" + event.clientX + "	Y="+event.clientY);
						//console.log("Position de la souris :  X=" + event.clientX + "	Y="+event.clientY);
								
								
								console.debug("Face : " + intersects[0].faceIndex);
								console.debug("Vertex a : " + intersects[0].face.a);
								console.debug("Vertex b : " + intersects[0].face.b);
								console.debug("Vertex c : " + intersects[0].face.c);
								
								<!-- console.debug(intersects[ 0 ].object.geometry.vertices[intersects[0].face.c]); -->
								
								<!-- info.innerHTML = 'Face a: ' + intersects[0].face.a + '<br/>Face b: ' +intersects[0].face.b + '<br/>Face c: ' +intersects[0].face.c; -->
								<!-- info.innerHTML = 'Face index: ' + intersects[0].faceIndex; -->
								insert = {id_poly: intersects[0].faceIndex, id_vertex_a: intersects[0].face.a, id_vertex_b: intersects[0].face.b, id_vertex_c: intersects[0].face.c};
								zone[nb_polys] = insert;
								nb_polys++;
						
						//var data = ["intersects[0].face.a", "intersects[0].face.b", "intersects[0].face.c"];		
						
					}
				}
			}
			
			function onMouseDown( event ) 
			{
				actif = true;
			}
			
			function onMouseUp( event ) 
			{
				onMouseMove(event);
				var com=[];
				actif = false;
				if (intersects.length > 0) // peut-être remplacer cela par un booléen de sélection active de zone
				{
					com = bootbox.prompt({
					size: "small",
					title: "Saisir commentaire !",
					inputType: 'text',
					callback: function (com) {
						console.log(com);
						zone = [];
						zones[nb_zones] = new Array(zone,com);
						nb_zones++;
						nb_polys = 0;
					for(var i = 0; i < nb_zones; i++)
					{
						index = i;
						texte += 'zone ' + i + ' : ' + zones[i][1] +'  '+ '<button onclick="modifCom('+index+')">Modifier</button>' + '<br />';
					}
					console.log("com:" + com[0]); // premier caractere
					console.log("zones:" + zones[0]);
					info.innerHTML = texte;
					texte = '';
					}
				});
					
				}
			}
			
			function toString(v) { return "[ " + v.x + ", " + v.y + ", " + v.z + " ]"; }

			function addTheShadowedLight( x, y, z, color, intensity ) 
			{
				theShadowLight = new THREE.DirectionalLight( color, intensity );
				theShadowLight.position.set( x, y, z )
				scene.add( theShadowLight );

				theShadowLight.castShadow = true;

				var d = 1;
				theShadowLight.shadow.camera.left = -d;
				theShadowLight.shadow.camera.right = d;
				theShadowLight.shadow.camera.top = d;
				theShadowLight.shadow.camera.bottom = -d;

				theShadowLight.shadow.camera.near = 1;
				theShadowLight.shadow.camera.far = 4;

				theShadowLight.shadow.mapSize.width = 1024;
				theShadowLight.shadow.mapSize.height = 1024;

				theShadowLight.shadow.bias = -0.005;
				//theShadowLight.shadowDarkness = 0.5; //removed from v82
			}

			function onWindowResize() {
				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function animate() 
			{
				requestAnimationFrame( animate );
				controls.update();
				theShadowLight.position.set(camera.position.x, camera.position.y, camera.position.z);

				render();
			}

			function render() {
				/* pass your data (the geometry in the scene + the camera definition)
				into the WebGL renderer, ie, into the Three.js default shaders */
				renderer.render( scene, camera );
			}
			
			function clavierEvent( event )
			{
				var code = event.keyCode;
				var rotated = true;
				switch( code )
				{
					case 37: meshPLY.rotation.y -= 0.03;	break;    // fleche gauche
					case 39: meshPLY.rotation.y += 0.03;    break;    // fleche droite
					case 38: meshPLY.rotation.x -= 0.03;    break;    // fleche haut
					case 40: meshPLY.rotation.x += 0.03;    break;    // fleche bas
					case 33: meshPLY.rotation.z -= 0.03;    break;    // page prec
					case 34: meshPLY.rotation.z += 0.03;    break;    // page suiv
					//case 36: meshPLY.rotation.set(0.2,-0.4,0);	break;    // touche home
					default: rotated = false;	
				}
				if (rotated)
					event.preventDefault();  // empecher la touche de faire defiler la page
					render();
			}
			
			function modifCom(ind)
			{
					//com = document.getElementById('');
					//alert('test modif com');
					zones[ind][1] = prompt("modifier le commentaire : ", zones[ind][1]);
					
					for(var i = 0; i < nb_zones; i++)
					{
						index = i;
						texte += 'zone ' + i + ' : ' + zones[i][1] +'  '+ '<button onclick="modifCom('+index+')">Modifier</button>' + '<br />';
					}
					
					info.innerHTML = texte;
					texte = '';
					
			}

	
