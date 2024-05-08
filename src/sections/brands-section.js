import FaSign from "@meronex/icons/fa/FaSign"
import FaCrown from "@meronex/icons/fa/FaCrown"
import { observer } from "mobx-react-lite";
import { SectionTab } from "polotno/side-panel"
import { useBrands } from "../data/graphql/api";
import { Spinner, Card, Tag } from "@blueprintjs/core";
import { contrast } from "../tools/colors"
import { useProject } from "../data/graphql/project";

const fieldStyle = { opacity: 0.8, marginRight: 10, justifySelf: "end" }
const imgStyle = { maxHeight: "5rem", maxWidth: "100%", backgroundColor: "white", borderRadius: 10, padding: 5 }

const BrandCard = ({brand, selected, selectBrand}) => {
  return (
    <Card key={brand.id} style={selected ? {outline: "#f5498b solid 3px"}: {}} onClick={selectBrand}>
      <div style={{ fontSize: 20, marginBottom: 10, textAlign: "center" }}>{brand.name}</div>
      <div style={{ display: "grid", gridTemplateColumns: "min-content auto", rowGap: 5, columnGap: 5, overflowX: "auto" }}>
        <span style={fieldStyle}>industry:</span>
        <span>{brand.industry}</span>

        <span style={fieldStyle}>phone:</span>
        <span>{brand.phone}</span>

        <span style={fieldStyle}>email:</span>
        <span>{brand.email}</span>

        <span style={fieldStyle}>tagline:</span>
        <span>{brand.tagline}</span>

        <span style={fieldStyle}>icon:</span>
        <img src={brand.icon} alt="icon" style={imgStyle}/>

        <span style={fieldStyle}>logo:</span>
        <img src={brand.logo} alt="logo" style={imgStyle}/>

        <span style={fieldStyle}>wordmark:</span>
        <img src={brand.wordmark} alt="wordmark" style={imgStyle}/>

        <span style={fieldStyle}>colors:</span>
        <div style={{display: "flex", flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {brand.colors.map(color => (
            <div key={color.id} style={{ backgroundColor: color.value, width: "2rem", height: "2rem", padding: 3, borderRadius: 3 }}>
              {color.primary && <FaCrown color={contrast(color.value)} />}
            </div>
          ))}
        </div>

        <span style={fieldStyle}>fonts:</span>
        <div style={{display: "flex", flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {brand.fonts.map(font => (
            <div key={font.id} style={{ fontFamily: font.value, fontWeight: font.bold ? "bold" : "normal", fontStyle: font.italic ? "italic" : "normal" }}>{font.name}</div>
          ))}
        </div>

        <span style={fieldStyle}>categories:</span>
        <div style={{display: "flex", flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {brand.specialCategories.map(category => (
            <Tag key={category.id}>{category.name}</Tag>
          ))}
        </div>
      </div>
    </Card>
  )
}

function brandsWhere(user) {
  return {
    email: user?.role !== "ADMIN" ? { equals: user?.email } : undefined
  }
}

export const MyBrandsPanel = observer(({ store }) => {
  const project = useProject()

  const [ brands, loading, error ] = useBrands({
    where: brandsWhere(project.user)
  })

  return (
    <div style={{ height: "100%" }}>
      {loading ?
        <div style={{ padding: "30px" }}>
          <Spinner />
        </div> :
      error ?
        <div>Error loading brands</div> :
        <div style={{ display: "flex", padding: "5px", height: "100%", overflow: "auto", flexDirection: "column", gap: 10, paddingBottom: 10 }}>
          <p>{brands.length} brands total</p>
          {brands.map(brand => (
            <BrandCard key={brand.id} brand={brand} selected={project.brand?.id === brand.id} selectBrand={() => project.setBrand(brand)} />
          ))}
        </div>}
    </div>
  )
})

// define the new custom section
export const MyBrandsSection = {
  name: "brands",
  Tab: (props) => (
    <SectionTab name="Brands" {...props}>
      <FaSign />
    </SectionTab>
  ),
  visibleInList: true,
  // we need observer to update component automatically on any store changes
  Panel: MyBrandsPanel,
};
