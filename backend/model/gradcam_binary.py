import torch
import numpy as np

def generate_cam(model, tensor, target_class=1):

    gradients = []
    activations = []

    def forward_hook(module, input, output):
        activations.append(output)

    def backward_hook(module, grad_input, grad_output):
        gradients.append(grad_output[0])

    # 🔥 Adaptive target layer for both ConvNeXt & EfficientNet
    if hasattr(model, "features"):
        target_layer = model.features[-1]
    else:
        return None

    fh = target_layer.register_forward_hook(forward_hook)
    bh = target_layer.register_backward_hook(backward_hook)

    output = model(tensor)
    score = output[0, target_class]

    model.zero_grad()
    score.backward()

    fh.remove()
    bh.remove()

    if not gradients:
        return None

    grad = gradients[0]
    act = activations[0]

    pooled_grad = torch.mean(grad, dim=(0, 2, 3))

    for i in range(act.shape[1]):
        act[:, i, :, :] *= pooled_grad[i]

    cam = torch.mean(act, dim=1).squeeze().detach().cpu().numpy()
    cam = np.maximum(cam, 0)

    if cam.max() != 0:
        cam /= cam.max()

    return cam
