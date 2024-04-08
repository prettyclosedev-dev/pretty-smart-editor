import * as mobx from "mobx";
import { createContext, useContext } from "react";
import * as api from "./api";
import { nanoid } from "nanoid";
import { debounce } from "lodash";
import { Intent } from "@blueprintjs/core";
import { URL_PREFIX } from "../config";

export const ProjectContext = createContext({});

export const useProject = () => useContext(ProjectContext);

class Project {
  id = "local";
  name = "";
  authToken = "";
  public = false;
  user = {};
  brand = {};
  categories = [];
  tags = [];
  skipSaving = false;
  loading = false;
  error = null;
  language =
    localStorage.getItem("polotno-language") || navigator.language || "en";
  pagesIds = [];
  toastRef = null;
  brandedDesignId = "";
  isBranded = false;

  constructor({ store }) {
    mobx.makeAutoObservable(this);
    this.store = store;

    store.on("change", () => {
      const pagesIds = store.pages?.map((page) => page.id);
      if (JSON.stringify(pagesIds) !== JSON.stringify(this.pagesIds)) {
        this.setPagesIds(pagesIds);
        this.setName("");
        this.setCategories([]);
        this.setTags([]);
        this.setPublic(false);
        this.id = "local";
        this.updateUrlWithProjectId();
        //   this.requestSave(true);
      } // else {
      //   this.requestSave();
      // }
    });

    // mobx.reaction(
    //   () => ({
    //     name: this.name,
    //     categories: this.categories,
    //     tags: this.tags,
    //     public: this.public,
    //   }),
    //   () => {
    //     this.requestSave();
    //   }
    // );
  }

  setToastRef(_ref) {
    this.toastRef = _ref;
  }

  setPagesIds(_pagesIds) {
    this.pagesIds = _pagesIds;
  }

  setLanguage(lang) {
    this.language = lang;
    localStorage.setItem("polotno-language", lang);
  }

  setName(_name) {
    this.name = _name;
  }

  setCategories(_categories) {
    this.categories = _categories;
  }

  addCategory(_category) {
    if (!this.categories) {
      this.categories = [];
    }

    if (!this.categories.some((category) => category.id === _category.id)) {
      this.categories = [_category, ...this.categories];
    }
  }

  removeCategory(_category) {
    this.categories = this.categories.filter(
      (category) => category.id !== _category.id
    );
  }

  setTags(_tags) {
    this.tags = _tags;
  }

  addTag(_tag) {
    if (!this.tags) {
      this.tags = [];
    }

    if (!this.tags.some((tag) => tag === _tag)) {
      this.tags.push(_tag);
    }
  }

  removeTag(_tag) {
    this.tags = this.tags.filter((tag) => tag !== _tag);
  }

  setPublic(_public) {
    this.public = _public;
  }

  setUser(_user) {
    this.user = _user;
  }

  setBrand(_brand) {
    this.brand = _brand;
    // fetch branded with this id

    if (!!this.brandedDesignId && this.id === "local") {
      api
        .getBrandedDesignById({
          id: this.brandedDesignId,
          user: this.user,
          brand: this.brand,
        })
        .then((res) => {
          this.loadBranded(res);
        });
    }
  }

  togglePublic() {
    this.public = !this.public;
  }

  setIsBranded(_isBranded) {
    this.isBranded = _isBranded;
  }

  setLoading(_loading) {
    this.loading = _loading;
  }

  setError(_error) {
    this.error = _error;

    if (_error) {
      this.toastRef?.show({
        timeout: 5000,
        onDismiss: () => {
          this.setError(null);
        },
        intent: Intent.DANGER,
        message: JSON.stringify(_error),
      });
    }
  }

  requestSave = debounce((doCreate) => {
    this.save(doCreate);
  }, 1000);

  loadBrandedById(id) {
    this.brandedDesignId = id;
    this.loadById(id);
  }

  async loadById(id) {
    this.id = id;
    this.updateUrlWithProjectId();
    this.setLoading(true);
    this.setError(null);

    try {
      const apiMethod = this.isBranded
        ? api.getBrandedDesignById
        : api.getDesignById;

      const {
        store,
        name,
        public: _public,
        categories,
        tags,
      } = await apiMethod({
        id,
        authToken: this.authToken,
        user: this.user,
        brand: this.brand,
      });

      if (store) {
        const pagesIds = store.pages?.map((page) => page.id);
        this.setPagesIds(pagesIds);

        this.store.loadJSON(store);
        // await this.store.waitLoading();
      }

      this.setName(name);
      this.setPublic(_public);
      this.setCategories(categories || []);
      this.setTags(tags || []);
    } catch (e) {
      console.log(e);
      this.setError(e);
    } finally {
      this.setLoading(false);
    }
  }

  async loadBranded(design) {
    this.setLoading(true);

    this.brandedDesignId = design.id;

    this.id = "local";
    this.updateUrlWithProjectId();
    const store = {
      ...design,
      pages: design?.pages?.map((page) => ({
        ...page,
        duration: page.duration || 0,
        id: nanoid(10),
      })),
    };
    this.setPagesIds(store.pages?.map((page) => page.id));
    this.store.loadJSON(store);
    this.setName(design.name);
    this.setPublic(false);
    this.setCategories(design.categories || []);
    this.setTags(design.tags || []);

    this.setLoading(false);

    // this.requestSave(true);
  }

  updateUrlWithProjectId() {
    if (!this.id || this.id === "local") {
      window.history.replaceState({}, null, `/`);
      return;
    }
    
    // let url = new URL(window.location.href);
    // let params = new URLSearchParams(url.search);
    // params.set("id", this.id);
    // const newPath = `/${URL_PREFIX}${this.isBranded ? "branded-design" : "design"}/${this.id}`;
    // const newUrl = `${newPath}?${params.toString()}`; // if we wanna keep other queries like email in in app editor

    window.history.replaceState(
      {},
      null,
      `/${URL_PREFIX}${this.isBranded ? "branded-design" : "design"}/${this.id}`
    );
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

  async save(doCreate) {
    if (this.loading) return;
    this.setLoading(true);
    const json = this.store.toJSON();
    const maxWidth = 200;
    const preview = await this.store.toDataURL({
      pixelRatio: maxWidth / json.width,
      mimeType: "image/jpeg",
    });

    if (!this.authToken) return;

    if (!this.id || this.id === "local") {
      const res = await api.createDesign({
        doCreate,
        store: {
          ...json,
          fonts: null,
          pages: { set: json.pages },
        },
        preview,
        // id: this.id,
        name: this.name,
        public: this.public,
        categories: {
          connect: this.categories.map((category) => ({ id: category.id })),
        },
        tags: { set: this.tags },
        creator: { connect: { email: this.user.email } },
        authToken: this.authToken,
      });

      if (res?.status === "saved") {
        this.id = res.id;
        this.updateUrlWithProjectId();
        this.setError(null);
      } else if (res?.status === "error") {
        this.setError(res?.error);
      }
    } else {
      const res = await api.saveDesign({
        store: {
          ...json,
          width: { set: json.width },
          height: { set: json.height },
          unit: { set: json.unit },
          dpi: { set: json.dpi },
          fonts: null,
          pages: { set: json.pages },
        },
        preview: { set: preview },
        id: Number(this.id),
        name: { set: this.name },
        public: this.public,
        categories: {
          set: this.categories.map((category) => ({ id: category.id })),
        },
        tags: {
          set: this.tags,
        },
        authToken: this.authToken,
        creator: { connect: { email: this.user.email } },
      });

      if (res?.status === "saved") {
        this.setError(null);
      } else if (res?.status === "error") {
        this.setError(res?.error);
      }
    }
    this.setLoading(false);
  }

  async duplicate() {
    this.id = "local";
    this.save();
  }

  async clear() {
    // await api.deleteDesign();
  }
}

export const createProject = (...args) => new Project(...args);
export default createProject;
