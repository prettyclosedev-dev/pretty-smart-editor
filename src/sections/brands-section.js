import FaCubes from "@meronex/icons/fa/FaCubes"
import FaCrown from "@meronex/icons/fa/FaCrown"
import { observer } from "mobx-react-lite";
import { SectionTab } from "polotno/side-panel"
import { useBrands } from "../data/graphql/api";
import { Spinner, Card, Tag } from "@blueprintjs/core";
import { contrast } from "../tools/colors"

const fieldStyle = { opacity: 0.8, marginRight: 10, justifySelf: "end" }
const imgStyle = { maxHeight: "5rem", maxWidth: "100%", backgroundColor: "white", borderRadius: 10, padding: 5 }

const BrandCard = ({brand}) => {
  return (
    <Card key={brand.id}>
      <div style={{ fontSize: 20, marginBottom: 10, textAlign: "center" }}>{brand.name}</div>
      <div style={{ display: "grid", gridTemplateColumns: "min-content auto", rowGap: 5, columnGap: 5 }}>
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
            <div style={{ backgroundColor: color.value, width: "2rem", height: "2rem", padding: 3, borderRadius: 3 }}>
              {color.primary && <FaCrown color={contrast(color.value)} />}
            </div>
          ))}
        </div>

        <span style={fieldStyle}>fonts:</span>
        <div style={{display: "flex", flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {brand.fonts.map(font => (
            <div style={{ fontFamily: font.value, fontWeight: font.bold ? "bold" : "normal", fontStyle: font.italic ? "italic" : "normal" }}>{font.name}</div>
          ))}
        </div>

        <span style={fieldStyle}>categories:</span>
        <div style={{display: "flex", flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {brand.specialCategories.map(category => (
            <Tag>{category.name}</Tag>
          ))}
        </div>
      </div>
    </Card>
  )
}

export const MyBrandsPanel = observer(({ store }) => {
  const [ brands, loading, error ] = useBrands()
  
  return (
    <div style={{ height: "100%" }}>
      {loading ?
        <div style={{ padding: "30px" }}>
          <Spinner />
        </div> :
      error ? 
        <div>Error loading brands</div> :
        <div style={{ display: "flex", paddingTop: "5px", height: "100%", overflow: "auto", flexDirection: "column" }}>
          <p>{brands.length} brands total</p>
          {brands.map(brand => (
            <BrandCard brand={brand} />
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
      <FaCubes />
    </SectionTab>
  ),
  visibleInList: true,
  // we need observer to update component automatically on any store changes
  Panel: MyBrandsPanel,
};