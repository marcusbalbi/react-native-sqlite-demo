/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import { useState, useEffect } from "react";
import { List } from "../../../types/List";
import {ListDB as database} from "../database/List"
import { useDatabase } from "../../../context/DatabaseContext";
// Hook for managing and accessing lists (CRUD)
export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List>();

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

  function searchByTitle(title: String) {
    return database.searchByTitlte(title).then(setLists)
  }

  async function selectList(list: List) {
    setSelectedList(list);
  }

  return {
    lists,
    selectedList,
    createList,
    deleteList,
    selectList,
    searchByTitle,
  };
}
