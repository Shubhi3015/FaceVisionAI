import streamlit as st
import torch
import numpy as np
from PIL import Image, ImageOps
from torchvision import transforms
import matplotlib.pyplot as plt

from pipeline.stage_04_geometry import RegionExtractionPipeline
from model.gradcam_binary import generate_cam
from model.draw_boxes import draw_issue_boxes
from inference.ensemble_predict import predict_issue
from recommendation import recommend_product

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

st.set_page_config(page_title="AI Skin Analyzer", layout="wide")
st.title("AI Skin Condition Analyzer")

# Initialize the logical region pipeline once (heavy models)
region_pipeline = RegionExtractionPipeline(output_root="data/processed")

# ---------------- Image Source Selection ----------------
st.subheader("Select Image Source")

col1, col2 = st.columns(2)

image = None

if "camera_active" not in st.session_state:
    st.session_state.camera_active = False

with col1:
    uploaded_file = st.file_uploader("Upload Image", type=["jpg", "jpeg", "png"])

with col2:
    if st.button("📷 Open Camera"):
        st.session_state.camera_active = True

# ---- Upload Priority ----
if uploaded_file is not None:
    image = Image.open(uploaded_file)
    image = ImageOps.exif_transpose(image).convert("RGB")
    st.session_state.camera_active = False

# ---- Camera Option ----
elif st.session_state.camera_active:
    camera_image = st.camera_input("Take a picture")

    if camera_image is not None:
        image = Image.open(camera_image)
        image = ImageOps.exif_transpose(image).convert("RGB")
        st.session_state.camera_active = False

# ---------------- Processing ----------------
if image is not None:

    image_np = np.array(image)

    st.subheader("Region-wise Analysis")

    regions = region_pipeline.process_image(image_np, name="input", save_outputs=False)

    if not regions:
        st.error("No valid face/regions detected.")
        st.stop()

    display_names = {
        "forehead": "Forehead",
        "left_cheek": "Left Cheek",
        "right_cheek": "Right Cheek",
        "chin": "Chin",
    }
    cols = st.columns(3)
    i = 0

    overall_scores = {"Acne": 0, "Redness": 0, "Pigmentation": 0}
    issue_count = {"Acne": 0, "Redness": 0, "Pigmentation": 0}

    for name, region_data in regions.items():
        region = region_data["image"]
        display_name = display_names.get(name, name)

        region_tensor = transform(Image.fromarray(region)).unsqueeze(0).to(device) # type: ignore
        issue, percent, selected_model = predict_issue(region_tensor)

        with cols[i % 3]:

            visual = region.copy()

            if issue != "Normal":
                # GradCAM overlay — only possible when the ensemble returns a model
                if selected_model is not None:
                    cam = generate_cam(selected_model, region_tensor)
                    visual = draw_issue_boxes(visual, cam, (255, 0, 0))

                overall_scores[issue] += percent
                issue_count[issue] += 1

                st.image(visual, caption=display_name)
                st.write(f"Detected Issue: **{issue}**")
                st.write(f"Confidence: **{percent}%**")

                # -------- Product Recommendation --------
                product, severity = recommend_product(issue, percent)

                st.write(f"Severity Level: **{severity}**")

                if product:
                    st.success("Recommended Product")
                    st.markdown(f"""
                    **Product Name:** {product['Product Name']}  
                    **Company:** {product['Company']}  
                    **Medication Type:** {product['Medication Type']}  
                    [🔗 View Product]({product['URL']})
                    """)
                else:
                    st.info("No matching product found.")

            else:
                st.image(region, caption=display_name)
                st.success("Normal")

        i += 1

    # ---------------- Overall Result ----------------
    st.markdown("---")
    st.subheader("Overall Skin Assessment")

    total_regions = sum(issue_count.values())

    if total_regions > 0:
        avg_scores = {
            k: (overall_scores[k] / issue_count[k]) if issue_count[k] > 0 else 0
            for k in overall_scores
        }

        dominant_issue = max(avg_scores, key=avg_scores.get) # type: ignore

        st.success(f"Primary Concern: {dominant_issue}")
        st.write(f"Average Severity Score: **{avg_scores[dominant_issue]:.2f}%**")

        # -------- Distribution Chart --------
        st.subheader("Issue Distribution")

        labels = list(avg_scores.keys())
        values = list(avg_scores.values())

        fig, ax = plt.subplots()
        ax.bar(labels, values)
        ax.set_ylabel("Average Confidence (%)")
        ax.set_title("Skin Issue Distribution")

        st.pyplot(fig)

        # -------- Overall Product Recommendation --------
        overall_product, overall_severity = recommend_product(dominant_issue, avg_scores[dominant_issue])

        st.subheader("Overall Recommendation")

        if overall_product:
            st.markdown(f"""
            **Product Name:** {overall_product['Product Name']}  
            **Company:** {overall_product['Company']}  
            **Medication Type:** {overall_product['Medication Type']}  
            [🔗 View Product]({overall_product['URL']})
            """)
        else:
            st.info("No overall product recommendation available.")

    else:
        st.success("Skin appears healthy. No major issues detected.")

    st.warning("⚠️ This is an AI-based preliminary analysis. Consult a dermatologist for professional advice.")