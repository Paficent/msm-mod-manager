import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Checkbox,
} from "@material-tailwind/react";

const ModCard = function (props: {
  mod: {
    name: string;
    thumbnail: string;
    description: string;
    author: string;
    version: string;
  };
}) {
  const mod = props.mod;
  return (
    <Card className="w-50" placeholder={""} color="gray">
      <CardHeader
        floated={false}
        className="h-65 text-center"
        color="gray"
        placeholder={""}
      >
        <Typography
          variant="h5"
          color="white"
          className="mb-2"
          placeholder={"Unknown Mod"}
        >
          {mod.name}
        </Typography>
        <Typography color="white" className="mb-2" placeholder={""}>
          By {mod.author} (v{mod.version})
        </Typography>
        <img src={mod.thumbnail} alt="Mod Thumbnail" width={250} height={100} />
      </CardHeader>
      <CardBody className="" placeholder={""}>
        <Typography
          color="gray"
          className="font-medium flex justify-left"
          textGradient
          placeholder={"Unknown"}
        >
          {mod.description}
        </Typography>
        <div className="flex justify-left">
          <Checkbox
            color="blue"
            label="Select"
            crossOrigin={""}
            className=""
          ></Checkbox>
        </div>
      </CardBody>
    </Card>
  );
};

export default ModCard;
