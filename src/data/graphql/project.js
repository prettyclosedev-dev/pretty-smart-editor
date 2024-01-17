import * as mobx from "mobx";
import { createContext, useContext } from "react";
import * as api from "./api";

export const ProjectContext = createContext({});

export const useProject = () => useContext(ProjectContext);

class Project {
  id = "";
  name = "";
  authToken = "";
  public = false;
  user = {};
  categories = [];
  skipSaving = false;

  constructor({ store }) {
    mobx.makeAutoObservable(this);
    this.store = store;

    store.on("change", () => {
      this.requestSave();
    });
  }

  setName(_name) {
    this.name = _name;
  }

  setCategories(_categories) {
    this.categories = _categories;
  }

  addCategory(_category) {
    if (!this.categories.some((category) => category.id === _category.id)) {
      this.categories.push(_category);
    }
  }

  removeCategory(_category) {
    this.categories = this.categories.filter(
      (category) => category.id !== _category.id
    );
  }

  setPublic(_public) {
    this.public = _public;
  }

  setUser(_user) {
    this.user = _user;
  }

  togglePublic() {
    this.public = !this.public;
  }

  requestSave() {
    if (this.saveTimeout) {
      return;
    }
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      // skip autosave if no project opened
      this.save();
    }, 5000);
  }

  async loadById(id) {
    this.id = id;
    this.updateUrlWithProjectId();
    try {
      const { store, name, _public, categories } = await api.getDesignById({
        id,
        authToken: this.authToken,
      });
      console.log(store, name);
      if (store) {
        this.store.loadJSON(store);
      }
      this.setName(name);
      this.setPublic(_public);
      this.setCategories(categories);
    } catch (e) {
      console.log(e);
      alert("Project can't be loaded !!!");
    }
  }

  updateUrlWithProjectId() {
    if (!this.id || this.id === "local") {
      window.history.replaceState({}, null, `/`);
      return;
    }
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search);
    params.set("id", this.id);
    window.history.replaceState({}, null, `/design/${this.id}`);
  }

  // async loadProject(dataJSON) {
  //   this.name = dataJSON.name || '';
  //   this.templateid = dataJSON.templateid || '';
  //   this.productconfiguration = dataJSON.productconfiguration || {};

  //   this.editorFunctions = await api.getEditorFunctions({
  //     templateid: this.templateid,
  //   });
  //   const req = await fetch(dataJSON.project + '?timestamp=' + Date.now());
  //   const json = await req.json();
  //   json.pages.forEach((page) => {
  //     page.children.forEach((element) => {
  //       if (element.custom?.logoBlock) {
  //         element.selectable = this.role === 'admin' ? true : false;
  //       }
  //     });
  //   });
  //   this.skipSaving = true;
  //   this.store.loadJSON(json);
  //   await this.store.waitLoading();
  //   await new Promise((resolve) => setTimeout(resolve, 50));
  //   this.store.history.clear();
  //   this.skipSaving = false;
  // }

  async save() {
    const json = this.store.toJSON();
    const maxWidth = 200;
    const preview = await this.store.toDataURL({
      pixelRatio: maxWidth / json.width,
      mimeType: "image/jpeg",
    });

    if (!this.authToken) return;

    if (!this.id) {
      const res = await api.createDesign({
        store: {
          ...json,
          fonts: null,
          pages: {
            createMany: {
              data: json.pages.map((p, idx) => {
                let copy = { ...p };
                copy.polotnoId = p.id;
                delete copy.id;
                return {
                  ...copy,
                  children: { set: copy.children },
                };
              }),
            },
          },
        },
        preview,
        // id: this.id,
        name: this.name,
        polotnoId: this.store.id,
        _public: this.public,
        categories: {
          connect: this.categories.map((category) => ({ id: category.id })),
        },
        creator: { connect: { email: this.user.email } },
        authToken: this.authToken,
      });

      if (res.status === "saved") {
        this.id = res.id;
        this.updateUrlWithProjectId();
      }
    } else {
      const res = api.saveDesign({
        store: {
          ...json,
          width: { set: json.width },
          height: { set: json.height },
          unit: { set: json.unit },
          dpi: { set: json.dpi },
          fonts: null,
          pages: {
            update: json.pages.map((p, idx) => {
              const copy = { ...p };
              return {
                where: {
                  polotnoId: p.id,
                },
                data: {
                  width: { set: p.width },
                  height: { set: p.height },
                  background: { set: p.background },
                  bleed: { set: p.bleed },
                  children: { set: copy.children },
                },
              };
            }),
          },
        },
        preview: { set: preview },
        id: Number(this.id),
        name: { set: this.name },
        _public: { set: this.public },
        categories: {
          set: this.categories.map((category) => ({ id: category.id })),
        },
        authToken: this.authToken,
      });
    }
  }

  async duplicate() {
    this.id = "local";
    this.save();
  }
}

export const createProject = (...args) => new Project(...args);
export default createProject;
