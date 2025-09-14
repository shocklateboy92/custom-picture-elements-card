# Custom Picture Elements Card

A customizable picture elements card for Home Assistant, forked from the original Home Assistant picture elements card with additional features and customization options.

## Features

- **Full Picture Elements Support**: All standard picture element types (state-badge, state-icon, state-label, icon, image, conditional)
- **Multiple Image Sources**: Static images, camera feeds, image entities, and person entities
- **State-Based Images**: Different images based on entity states
- **Theme Support**: Full Home Assistant theme integration
- **Dark Mode**: Separate images and filters for dark mode
- **Camera Integration**: Live camera feeds and snapshots
- **Aspect Ratio Control**: Maintain specific image proportions
- **Custom Filters**: Apply custom CSS filters based on states
- **Visual Editor**: Easy-to-use configuration editor
- **Responsive Design**: Works on all device sizes

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Go to Frontend
3. Click the 3-dot menu and select "Custom repositories"
4. Add this repository URL: `https://github.com/yourusername/custom-picture-elements-card`
5. Select category: "Lovelace"
6. Click "Add"
7. Find "Custom Picture Elements Card" and install it
8. Restart Home Assistant

### Manual Installation

1. Download the `custom-picture-elements-card.js` file from the [latest release](https://github.com/yourusername/custom-picture-elements-card/releases)
2. Copy it to your `config/www/` directory
3. Add the following to your Lovelace dashboard resources:
   ```yaml
   resources:
     - url: /local/custom-picture-elements-card.js
       type: module
   ```

## Configuration

### Basic Example

```yaml
type: custom:custom-picture-elements-card
image: /local/floorplan.png
elements:
  - type: state-badge
    entity: light.living_room
    style:
      top: 50%
      left: 30%
  - type: state-icon
    entity: sensor.temperature
    style:
      top: 20%
      left: 70%
```

### Advanced Example

```yaml
type: custom:custom-picture-elements-card
title: House Control
image: /local/floorplan.png
dark_mode_image: /local/floorplan-dark.png
camera_image: camera.front_door
camera_view: live
aspect_ratio: "16:9"
state_image:
  home: /local/house-home.png
  away: /local/house-away.png
state_filter:
  away: grayscale(100%)
elements:
  - type: state-badge
    entity: light.living_room
    style:
      top: 30%
      left: 40%
  - type: state-label
    entity: sensor.temperature
    style:
      top: 10%
      left: 90%
      color: white
      font-size: 16px
  - type: icon
    icon: mdi:door
    title: Front Door
    style:
      top: 60%
      left: 20%
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | **Required** | `custom:custom-picture-elements-card` |
| `title` | string | Optional | Card title |
| `image` | string | Optional | URL of the image to display |
| `image_entity` | string | Optional | Entity ID of an image or person entity |
| `camera_image` | string | Optional | Entity ID of a camera |
| `camera_view` | string | `auto` | `auto` or `live` |
| `state_image` | object | Optional | Different images based on entity state |
| `state_filter` | object | Optional | CSS filters based on entity state |
| `entity` | string | Optional | Entity for state-based images/filters |
| `aspect_ratio` | string | Optional | Force aspect ratio (e.g., "16:9") |
| `theme` | string | Optional | Theme to use |
| `dark_mode_image` | string | Optional | Image to use in dark mode |
| `dark_mode_filter` | string | Optional | Filter to apply in dark mode |
| `elements` | list | **Required** | List of elements to display |

### Element Types

- `state-badge`: Shows entity state with badge
- `state-icon`: Shows entity icon that changes with state
- `state-label`: Shows entity state as text
- `icon`: Static icon
- `image`: Static image
- `conditional`: Conditional element container

Each element supports positioning via the `style` option with `top` and `left` CSS properties.

## Development

To build from source:

```bash
npm install
npm run build
```

## Support

For issues and feature requests, please use the [GitHub repository](https://github.com/yourusername/custom-picture-elements-card/issues).

## License

MIT License - see LICENSE file for details.