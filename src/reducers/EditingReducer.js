import { _components, storage } from '../cache/ComponentCache';

const initialState = {
  components: [],
  currComponent: null,
  currComponentId: null
}

// HELPER FUNCTION
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
	let page;
	let userId;


	switch (action.type) {
		case 'ADD_COMPONENT':
			elem = action.componentType;
			project = action.project;
			page = action.page || null;
			userId = action.userId || null;
			idInStorage = _components[elem](project, page, userId);
			return Object.assign({}, state, {
				components: [...state.components, {componentId: idInStorage, type: action.componentType, projectId: project.projectId}]
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
			page = action.page || null;
			userId = action.userId;

			// console.log('THIS IS STORAGE BEFORE', storage);
			let newObjectId = _components[elem](project, page, userId);
			storage[newObjectId].parent = {componentId: action.componentId, type: parentEle.type, projectId: project.projectId};
			storage[action.componentId].children.push({componentId: newObjectId, type: action.componentType, projectId: project.projectId });
			// console.log('STORAGE HAS BEEN UPDATED WITH A NEW CHILD', storage);
			return Object.assign({}, state, {
				currComponent: {
					...state.currComponent,
					children: [...state.currComponent.children]
				}
			});
		case 'DELETE_COMPONENT':
			componentFromStorage = storage[action.componentId];
			// REFACTOR THIS PART TO BE MORE EFFICENT (OBJECT????)
			if (componentFromStorage.type === 'UserContainer' || componentFromStorage.type === 'GalleryPost' || componentFromStorage.type === 'Carousel') {
				recurseDelete(componentFromStorage);
			}
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
		  var projectId = 1;
			return Object.assign({}, state, {
				currComponent: storage['body' + projectId],
				currComponentId: 'body' + projectId
			});
		case 'CHANGE_BODY_PROPS':
			console.log(action.newProps, 'THIS IS THE NEW PROPERTIES OF THE AFSDFASDF');
			var projectId = 1;
			storage['body' + projectId].css = action.newProps;
			return Object.assign({}, state, {
				currComponent: storage['body' + projectId]
			});
    case 'UPDATE_STORAGE_COMPONENTS':
    	console.log('=======-----------=================================================')
      console.log(action.components);
      return Object.assign({}, state, {
      	components: action.components
      })
		default:
			return state
	}
}
