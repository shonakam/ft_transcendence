import { Component } from "./Component";
export interface Routes {
  [key: string]: () => Component;
}
