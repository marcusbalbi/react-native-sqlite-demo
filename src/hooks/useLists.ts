/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import { useState, useEffect } from "react";
import { List } from "../types/List";
import { useDatabase } from "../context/DatabaseContext";
import { ListItem } from "../types/ListItem";

// Hook for managing and accessing lists (CRUD)
export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List>();
  const [selectedListsItems, setSelectedListsItems] = useState<ListItem[]>([]);
  const database = useDatabase();

  useEffect(() => {
    refreshListOfLists();
  }, []);

  function refreshListOfLists() {
    // Query all lists from the DB, then store them as state
    return database.getAllLists().then(setLists);
  }

  function createList(newListTitle: string): Promise<void> {
    return database.createList(newListTitle).then(refreshListOfLists);
  }

  function deleteList(listToDelete: List): Promise<void> {
    if (listToDelete !== undefined) {
      return database.deleteList(listToDelete).then(refreshListOfLists);
    }
    // otherwise:
    return Promise.reject(Error("Could not delete an undefined list"));
  }

  function refreshListsItems(listToRefresh = selectedList, doneItemsLast = false): Promise<void> {
    console.log(`Refreshing list items for list: ${listToRefresh && listToRefresh.title}`);

    if (listToRefresh !== undefined) {
      return database
        .getListItems(listToRefresh, doneItemsLast)
        .then((selectedListsItems) => setSelectedListsItems(selectedListsItems));
    }
    // otherwise, listToRefresh is undefined
    return Promise.reject(Error("Could not refresh an undefined list's items"));
  }

  async function selectList(list: List) {
    setSelectedList(list);
    await refreshListsItems(list);
  }

  return {
    lists,
    selectedList,
    selectedListsItems,
    createList,
    deleteList,
    selectList,
  };
}
