var uuid = require('uuid');
/* Down below there are core functions for the mainpulate data from db.
The idea is simple:
I have an idea for a container management application where
each container has a pre-defined type and category and a description,
and each container can have other containers inside. 
*/
function filterContainersByStringAtrr(json, atrr) {
  if (!json || !atrr || typeof atrr !== 'object') return [];
  
  const containers = [];
  for (const key in json) {
    if (key === 'containers') {
      for (const container of json[key]) {
        let match = true;
        for (const atrrKey in atrr) {
          if (typeof atrr[atrrKey] === 'object') {
            const operator = Object.keys(atrr[atrrKey])[0];
            const value = atrr[atrrKey][operator];
            if (operator === 'include') {
              if (!container.atrr[atrrKey].includes(value)) match = false;
            }
          } else {
            if (container.atrr[atrrKey] !== atrr[atrrKey]) {
              match = false;
              break;
            }
          }
        }
        if (match) containers.push(container);
        containers.push(...filterContainersByAtrr(container, atrr));
      }
    } else if (json[key] && typeof json[key] === 'object') {
      containers.push(...filterContainersByAtrr(json[key], atrr));
    }
  }
  return containers;
}
function findContainerByUuid(json, uuid) {
  if (!json || !uuid) return null;

  for (const key in json) {
    if (key === 'containers') {
      for (const container of json[key]) {
        if (container.uuid === uuid) return container;
        const foundContainer = findContainerByUuid(container, uuid);
        if (foundContainer) return foundContainer;
      }
    } else if (json[key] && typeof json[key] === 'object') {
      const foundContainer = findContainerByUuid(json[key], uuid);
      if (foundContainer) return foundContainer;
    }
  }
  return null;
}
function findTypeByUuid(json, uuid) {
  if (!json || !uuid) return null;

  for (const key in json) {
    if (key === 'types') {
      for (const type of json[key]) {
        if (type.uuid === uuid) return type;
      }
    } else if (json[key] && typeof json[key] === 'object') {
      const foundType = findTypeByUuid(json[key], uuid);
      if (foundType) return foundType;
    }
  }
  return null;
}
function findCategoryByUuid(json, uuid) {
  if (!json || !uuid) return null;

  for (const key in json) {
    if (key === 'categories') {
      for (const category of json[key]) {
        if (category.uuid === uuid) return category;
      }
    } else if (json[key] && typeof json[key] === 'object') {
      const foundCategory = findCategoryByUuid(json[key], uuid);
      if (foundCategory) return foundCategory;
    }
  }
  return null;
}
/*function findAtrrInContainers(json, atrr) {
  if (!json || !atrr) return null;
  const foundContainers = [];
  for (const key in json) {

    if (key === 'containers') {

      for (const container of json[key]) {
        if (container.atrr === atrr) foundContainers.push(container);
        const nestedFoundContainers = findAtrrInContainers(container, atrr);
        foundContainers.push(...nestedFoundContainers);
      }
    } else if (json[key] && typeof json[key] === 'object') {
      const nestedFoundContainers = findAtrrInContainers(json[key], atrr);
      foundContainers.push(...nestedFoundContainers);
    }
  }
  return foundContainers;
}*/
function findAtrrInContainers(json, atrr) {
    if (!json || !atrr) return null;
    const foundContainers = [];
    for (const key in json) {
      if (key === 'containers') {
        for (const container of json[key]) {
          if (container.atrr === atrr) foundContainers.push(container.uuid);  // return uuid instead of container
          const nestedFoundContainers = findAtrrInContainers(container, atrr);
          foundContainers.push(...nestedFoundContainers);
        }
      } else if (json[key] && typeof json[key] === 'object') {
        const nestedFoundContainers = findAtrrInContainers(json[key], atrr);
        foundContainers.push(...nestedFoundContainers);
      }
    }
    return foundContainers;
  }
  function filterContainersByAtrr(json, atrr) {
    if (!json || !atrr || typeof atrr !== 'object') return [];
    const containers = [];
    for (const key in json) {
      if (key === 'containers') {
        for (const container of json[key]) {
          let match = true;
          for (const atrrKey in atrr) {
            if (container.atrr[atrrKey] !== atrr[atrrKey]) {
              match = false;
              break;
            }
          }
          if (match) containers.push(container.uuid);  // return uuid instead of container
          containers.push(...filterContainersByAtrr(container, atrr));
        }
      } else if (json[key] && typeof json[key] === 'object') {
        containers.push(...filterContainersByAtrr(json[key], atrr));
      }
    }
    return containers;
  }
  
/*
function filterContainersByAtrr(json, atrr) {
  if (!json || !atrr || typeof atrr !== 'object') return [];

  const containers = [];
  for (const key in json) {
    if (key === 'containers') {
      for (const container of json[key]) {
        let match = true;
        for (const atrrKey in atrr) {
          if (container.atrr[atrrKey] !== atrr[atrrKey]) {
            match = false;
            break;
          }
        }
        if (match) containers.push(container);
        containers.push(...filterContainersByAtrr(container, atrr));
      }
    } else if (json[key] && typeof json[key] === 'object') {
      containers.push(...filterContainersByAtrr(json[key], atrr));
    }
  }
  return containers;
}*/
function addContainer(json, container) {
  // Find the parent container that the new container should be added to
  const parentContainer = findContainerByUuid(json, container.parentUuid);
  // If a parent container was found, add the new container to it
  if (parentContainer) {
    parentContainer.containers.push(container);
  }
}
function moveContainer(json, containerUuid, newParentUuid) {
  // Find the container to be moved
  const container = findContainerByUuid(json, containerUuid);
  // Find the new parent container
  const newParentContainer = findContainerByUuid(json, newParentUuid);
  // If both the container and the new parent container were found, remove the container from its current parent and add it to the new parent
  if (container && newParentContainer) {
    // Find the current parent container of the container to be moved
    const currentParentContainer = findContainerByUuid(json, container.parentUuid);
    // Remove the container from its current parent
    currentParentContainer.containers = currentParentContainer.containers.filter(c => c.uuid !== containerUuid);
    // Set the new parent UUID for the container
    container.parentUuid = newParentUuid;
    // Add the container to the new parent
    newParentContainer.containers.push(container);
  }
}
function addType(json, type) {
  json.types.push(type);
}

function deleteType(json, typeUuid) {
  json.types = json.types.filter(t => t.uuid !== typeUuid);
}
function addCategory(json, category) {
  json.categories.push(category);
}

function deleteCategory(json, categoryUuid) {
  json.categories = json.categories.filter(c => c.uuid !== categoryUuid);
}
function deleteContainer(json, containerUuid) {
  // Find the container to be deleted
  const container = findContainerByUuid(json, containerUuid);
  // If the container was found, remove it from its parent
  if (container) {
    // Find the parent container of the container to be deleted
    const parentContainer = findContainerByUuid(json, container.parentUuid);
    // Remove the container from its parent
    parentContainer.containers = parentContainer.containers.filter(c => c.uuid !== containerUuid);
  }
}
module.exports = {deleteContainer, deleteCategory, addCategory, deleteCategory, deleteType, addType, moveContainer,
    addContainer, findContainerByUuid, filterContainersByAtrr, findAtrrInContainers, findCategoryByUuid, findTypeByUuid, filterContainersByStringAtrr
}