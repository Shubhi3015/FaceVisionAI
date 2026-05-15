import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torchvision.models import convnext_tiny, ConvNeXt_Tiny_Weights
from torch.utils.data import DataLoader
import os

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 🔥 CHANGE THIS FOR EACH MODEL
ISSUE_NAME = "acne"  # acne / redness / pigmentation
DATASET_PATH = f"dataset/{ISSUE_NAME}_binary"
MODEL_SAVE_PATH = f"models/{ISSUE_NAME}_model.pth"

BATCH_SIZE = 32
EPOCHS = 20

train_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomResizedCrop(224, scale=(0.85, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

train_dataset = datasets.ImageFolder(os.path.join(DATASET_PATH, "train"), transform=train_transform)
val_dataset = datasets.ImageFolder(os.path.join(DATASET_PATH, "val"), transform=val_transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)

print("Classes:", train_dataset.classes)

# -------- Handle Imbalance --------
class_counts = [0, 0]
for _, label in train_dataset:
    class_counts[label] += 1

weights = [sum(class_counts) / c for c in class_counts]
class_weights = torch.tensor(weights).to(device)

model = convnext_tiny(weights=ConvNeXt_Tiny_Weights.DEFAULT)
model.classifier[2] = nn.Linear(model.classifier[2].in_features, 2)
model = model.to(device)

criterion = nn.CrossEntropyLoss(weight=class_weights)
optimizer = optim.AdamW(model.parameters(), lr=1e-5)

best_val_acc = 0

for epoch in range(EPOCHS):

    model.train()
    correct = total = 0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        _, preds = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (preds == labels).sum().item()

    train_acc = 100 * correct / total

    model.eval()
    val_correct = val_total = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)

            val_total += labels.size(0)
            val_correct += (preds == labels).sum().item()

    val_acc = 100 * val_correct / val_total

    print(f"Epoch {epoch+1}/{EPOCHS} | Train: {train_acc:.2f}% | Val: {val_acc:.2f}%")

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        print("Model Saved")

print("Best Validation Accuracy:", best_val_acc)