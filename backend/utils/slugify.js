import slugify from "slugify";

export default function generateSlug(str){
    return slugify(str, {
        replacement: '-',
        lower: true
    })
}