import * as mobx from "mobx";
import { createContext, useContext } from "react";
import * as api from "./api";
import { nanoid } from "nanoid";
import { debounce } from "lodash";
import { Intent } from "@blueprintjs/core";
import { URL_PREFIX } from "../config";
import { getUser } from "../graphql/api";

class Project {
  id = "local";
  name = "";
  authToken = localStorage.getItem("authToken") || "";
  public = false;
  user = JSON.parse(localStorage.getItem("user")) || {}; // Regular user field
  loginUser = JSON.parse(localStorage.getItem("loginUser")) || {}; // New loginUser field
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

  constructor({ store, authToken, email, id }) {
    mobx.makeAutoObservable(this, {
      isAuthenticated: mobx.computed,
    });

    this.store = store;

    if (this.loginUser.email || email) {
      this.fetchUserByEmail(this.loginUser.email || email);
    }

    if (authToken) {
      this.setAuthToken(authToken);
    }
    if (id) {
      this.loadBrandedById(id);
    }

    store.on("change", () => {
      this.handleStoreChange();
    });
  }

  async fetchUserByEmail(email) {
    try {
      const user = await getUser(email);
      this.setUser(user);
    } catch (error) {
      console.error("Error fetching user by email:", error);
    }
  }

  handleStoreChange() {
    const pagesIds = this.store.pages?.map((page) => page.id);
    if (JSON.stringify(pagesIds) !== JSON.stringify(this.pagesIds)) {
      this.setPagesIds(pagesIds);
      this.resetProjectDetails();
      this.updateUrlWithProjectId();
    }
  }

  resetProjectDetails() {
    this.setName("");
    this.setCategories([]);
    this.setTags([]);
    this.setPublic(false);
    this.id = "local";
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
    localStorage.setItem("user", JSON.stringify(_user));
  }

  setAuthToken(_authToken) {
    this.authToken = _authToken;
    localStorage.setItem("authToken", _authToken);
  }

  setBrand(_brand) {
    this.brand = _brand;
    if (this.brandedDesignId && this.id === "local") {
      this.loadBrandedById(this.brandedDesignId);
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
  }

  updateUrlWithProjectId() {
    if (!this.id || this.id === "local") {
      window.history.replaceState({}, null, `/`);
      return;
    }
    window.history.replaceState(
      {},
      null,
      `/${URL_PREFIX}${this.isBranded ? "branded-design" : "design"}/${this.id}`
    );
  }

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

    const saveData = {
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
    };

    try {
      let res;
      if (!this.id || this.id === "local") {
        res = await api.createDesign({ doCreate, ...saveData });
      } else {
        res = await api.saveDesign(saveData);
      }

      if (res?.status === "saved") {
        this.id = res.id;
        this.updateUrlWithProjectId();
        this.setError(null);
      } else if (res?.status === "error") {
        this.setError(res?.error);
      }
    } catch (error) {
      console.error("Error saving design:", error);
    } finally {
      this.setLoading(false);
    }
  }

  async duplicate() {
    this.id = "local";
    this.save();
  }

  async clear() {
    // await api.deleteDesign();
  }

  get isAuthenticated() {
    return !!this.user && !!this.user.email;
  }

  logout = () => {
    this.setUser({});
    this.setLoginUser({});
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("loginUser");
  };

  setLoginUser = async (_loginUser) => {
    this.loginUser = _loginUser;
    localStorage.setItem("loginUser", JSON.stringify(_loginUser));

    if (this.loginUser.email) {
      try {
        const user = await getUser(this.loginUser.email);
        this.setUser(user);
      } catch (error) {
        console.error("Error fetching user by email:", error);
      }
    }
  };
}

/**
 * @type React.Context<Project>
 */
export const ProjectContext = createContext({});

export const useProject = () => useContext(ProjectContext);

export const createProject = (...args) => new Project(...args);
export default createProject;
