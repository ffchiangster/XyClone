import { _components, storage } from '../cache/ComponentCache';
import { _record } from '../cache/StorageCache';

const initialState = {
  components: [],
  currComponent: null,
  currComponentId: null,
  currPage: 'IndexPage',
  pages: [],
  swapFlag: false
}

// HELPER FUNCTION

// MIGHT NEED TO REFACTOR TO FIND CERTAIN PROJECT ELEMENT
let recurseDelete = (element) => {
	// console.log(element, 'RECURSEDELETE WITH ELEMENT');
	if (element.children.length > 0) {
		for (let i = 0; i < element.children.length; i++) {
			recurseDelete(storage[element.children[i].componentId]);
		}
	}
	element.children.length = 0;
}

export default function xyclone (state = initialState, action) {

	let elem;
	let idInStorage;
	let componentFromStorage;
	let project;
	let projectId;
	let page;
	let userId;
	let swapFlagTemp;

	switch (action.type) {
		case 'ADD_COMPONENT':
			elem = action.componentType;
			project = action.project;
			page = action.page || 'IndexPage'; // IndexPage is default page
			userId = action.userId || null;
			idInStorage = _components[elem](project, page, userId);

			return Object.assign({}, state, {
				components: [...state.components,
          {
            componentId: idInStorage,
            type: action.componentType,
            projectId: project.projectId,
            page: page
          }
        ]
			});


		case 'EDIT_COMPONENT':
			// console.log('IN EDIT COMPONENT SWITCH', action.component)
			return Object.assign({}, state, {
				currComponent: action.component,
				currComponentId: action.componentId
			});
		case 'CHANGE_STYLE':
			console.log('CHANGING STYLE');
			console.log(storage);
			// project = action.project;
			// page = action.page || null;
			// userId = action.userId
			// REFACTOR THIS TO GET PROJECTID/PAGE AND EVERYTHING FROM ACIOTN.CURRCOMPONENT
			var newItem = Object.assign({}, storage[action.componentId], {});
			for (let key in action.newProps) {
				console.log(action.newProps);
				console.log(action.newProps[key]);
				console.log('========================');
				newItem[key] = action.newProps[key];
			}
			storage[action.componentId] = newItem;
			console.log(storage);
			return Object.assign({}, state, {
				currComponent: newItem,
				currComponentId: action.componentId
			});
		case 'ADD_CHILDREN':
			// console.log('ADDING A CHILD INTO', action.componentId);
			var parentEle = storage[action.componentId];
			elem = action.componentType;
			project = action.project;
			page = action.page || 'IndexPage'; // Index page is default
			userId = action.userId;
			console.log(project);
			// console.log('THIS IS STORAGE BEFORE', storage);
			let newObjectId = _components[elem](project, page, userId);
			storage[newObjectId].parent = {componentId: action.componentId, type: parentEle.type, projectId: project.projectId, page: page};
			storage[action.componentId].children.push({componentId: newObjectId, type: action.componentType, projectId: project.projectId, page: page });
			// console.log('STORAGE HAS BEEN UPDATED WITH A NEW CHILD', storage);
			return Object.assign({}, state, {
				currComponent: {
					...state.currComponent,
					children: [...state.currComponent.children]
				}
			});

		case 'DELETE_COMPONENT':
			componentFromStorage = action.component;
			console.log(componentFromStorage, 'THIS IS COMPONENT FROM STORAGE');
			// REFACTOR THIS PART TO BE MORE EFFICENT (OBJECT????)
			if (componentFromStorage.type === 'UserContainer' || componentFromStorage.type === 'GalleryPost' || componentFromStorage.type === 'Carousel') {
				recurseDelete(componentFromStorage);
			}

			//MIGHT NEED TO REFACTOR TO FIND CERTAIN PROEJCT COMPONENT IS FROM
			if (Object.keys(componentFromStorage.parent).length !== 0) {
				storage[componentFromStorage.parent.componentId].children = storage[componentFromStorage.parent.componentId].children.filter((ref) => ref.componentId !== action.componentId);
			}
			delete storage[action.componentId];

			return Object.assign({}, state, {
				components: state.components.filter((ref) => ref.componentId !== action.componentId),
				currComponent: null,
				currComponentId: null
			});
		case 'EDIT_BODY_CLICK':
		  console.log(' SETTING FOCUS TO THE BODY');
		  // PLACEHOLDER FOR PROJECT ID
		  projectId = action.projectId
		  swapFlagTemp = state.swapFlag ? false : false;
			return Object.assign({}, state, {
				currComponent: storage['body' + projectId],
				currComponentId: 'body' + projectId,
				swapFlag: false
			});
		case 'CHANGE_BODY_PROPS':
			console.log(action.newProps, 'THIS IS THE NEW PROPERTIES OF THE AFSDFASDF');
			projectId = action.projectId
			var newItem = Object.assign({}, storage['body' + action.projectId], {});
			for (let key in action.newProps) {
				newItem.css[key] = action.newProps[key];
			}
			storage['body' + projectId] = newItem
			return Object.assign({}, state, {
				currComponent: newItem
			});
    case 'UPDATE_STORAGE_COMPONENTS':
    	console.log('=======-----------=================================================')
      console.log(action.components);
      return Object.assign({}, state, {
      	components: action.components
      });
    case 'TOGGLE_SWAP_FLAG':
    	console.log('TOGGLING SWAP FLAG');
    	return Object.assign({}, state, {
    		swapFlag: !state.swapFlag
    	});
    case 'SWAP_COMPONENTS':
    	console.log('ABOUT TO SWAP COMPONENTS.');
    	let objToSwap1;
    	let objToSwap2;
    	if (JSON.stringify(action.idToSwap).includes('body')) {
    		console.log('IT INCLUDES BODY');
    		return Object.assign({}, state, {
    			swapFlag: !state.swapFlag
    		});
    	}
    	for (let key in storage) {
    		console.log(action.idToSwap, key);
    		if (JSON.stringify(state.currComponentId) === key) {
    			objToSwap1 = [storage[key], key];
    		} else if (JSON.stringify(action.idToSwap) === key) {
	    		if (storage[key].project.projectId === action.projectId) {
	    			console.log('here');
	    			objToSwap2 = [storage[key], key];
	    		}
    		}
    	}
    	storage[objToSwap1[1]] = objToSwap2[0];
    	storage[objToSwap2[1]] = objToSwap1[0];
    	console.log(state.components);
    	let newStateComponents = state.components.map(function(component) {
				if (component.componentId === JSON.parse(objToSwap1[1])) {
    				component.type = objToSwap2[0].type;
  			} else {
	  			if (component.componentId === JSON.parse(objToSwap2[1])) {
	  				component.type = objToSwap1[0].type;
	  			}
	  		}
	  		return component;
    	});
    	return Object.assign({}, state, {
    		components: newStateComponents,
    		currComponentId: action.idToSwap,
    		swapFlag: !state.swapFlag
    	});
 		default:
			return state
	}
}
